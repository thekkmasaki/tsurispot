import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Cognito from "next-auth/providers/cognito";
import { getUserByProvider, getUserById, createUser, updateAvatarUrl } from "@/lib/user-store";

interface CognitoProfile {
  sub: string;
  email?: string;
  name?: string;
  given_name?: string;
  picture?: string;
  identities?:
    | string
    | Array<{ providerName?: string; providerType?: string; userId?: string }>;
  "cognito:username"?: string;
}

const KNOWN_UPSTREAMS = new Set([
  "google",
  "apple",
  "signinwithapple",
  "facebook",
  "amazon",
  "line",
]);

function extractUpstreamProvider(profile: CognitoProfile | undefined): string {
  if (!profile) return "cognito";

  const idsRaw = profile.identities;
  if (typeof idsRaw === "string") {
    try {
      const parsed = JSON.parse(idsRaw);
      if (Array.isArray(parsed) && parsed[0]?.providerName) {
        return String(parsed[0].providerName).toLowerCase();
      }
    } catch {
      /* ignore */
    }
  } else if (Array.isArray(idsRaw) && idsRaw[0]?.providerName) {
    return String(idsRaw[0].providerName).toLowerCase();
  }

  const username = profile["cognito:username"];
  if (typeof username === "string" && username.includes("_")) {
    const prefix = username.split("_")[0].toLowerCase();
    if (KNOWN_UPSTREAMS.has(prefix)) return prefix;
  }

  return "cognito";
}

// Cognito 独自ドメイン(例: https://auth.tsurispot.com)化のための任意上書き。
// COGNITO_DOMAIN が設定されている時だけ OAuth エンドポイントを独自ドメインに向ける。
// 未設定なら issuer からの OIDC discovery で従来どおり動作する（挙動完全不変・env を外せば即ロールバック）。
// ※ id_token の iss 検証に使う issuer(cognito-idp...) は独自ドメインでも不変なので COGNITO_ISSUER は据え置く。
const cognitoCustomDomain = process.env.COGNITO_DOMAIN?.replace(/\/+$/, "");
const cognitoEndpointOverrides = cognitoCustomDomain
  ? {
      authorization: {
        url: `${cognitoCustomDomain}/oauth2/authorize`,
        params: { scope: "openid email profile" },
      },
      token: `${cognitoCustomDomain}/oauth2/token`,
      userinfo: `${cognitoCustomDomain}/oauth2/userInfo`,
    }
  : {};

const config: NextAuthConfig = {
  // App Runner / CloudFront 経由のため、Host ヘッダーを信頼してよい。
  trustHost: true,
  // 本番デフォルト OFF。OAuth トラブル調査時のみ App Runner 環境変数 NEXTAUTH_DEBUG=true で一時 ON。
  debug: process.env.NEXTAUTH_DEBUG === "true",
  // ログイン「初回失敗(error=Configuration)・2回目成功」の真因確定用。
  // コールバック段の失敗は内部的にほぼ InvalidCheck(pkce cookie missing / could not be parsed)
  // に集約されるため、name/message/cause を App Runner ログへ常時出して切り分ける。
  // (env を触らずに本番ログで根因を掴むための恒久ロガー)
  logger: {
    error(error: Error) {
      const cause = (error as { cause?: { message?: string } })?.cause?.message;
      console.error(
        "[auth][error]",
        error?.name ?? "UnknownError",
        error?.message ?? "",
        cause ? `cause=${cause}` : "",
      );
    },
  },
  providers: [
    Cognito({
      clientId: process.env.COGNITO_CLIENT_ID,
      clientSecret: process.env.COGNITO_CLIENT_SECRET,
      issuer: process.env.COGNITO_ISSUER,
      ...cognitoEndpointOverrides,
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, account, profile, trigger, session: updateData }) {
      if (account?.providerAccountId) {
        token.tsuriId = undefined;
        token.nickname = undefined;
        token.avatarUrl = undefined;
        token.provider = undefined;
        token.isNewUser = undefined;
        token.reportCount = undefined;

        const provider = account.provider;
        const providerId = account.providerAccountId;
        const cognitoProfile = profile as CognitoProfile | undefined;

        const upstream = extractUpstreamProvider(cognitoProfile);
        const displayName =
          cognitoProfile?.name ||
          cognitoProfile?.given_name ||
          undefined;
        const picture = cognitoProfile?.picture;

        try {
          let user = await getUserByProvider(provider, providerId);

          if (!user) {
            const tsuriId = crypto.randomUUID();
            const newUser = {
              id: tsuriId,
              nickname: displayName || `釣り人${tsuriId.slice(0, 6)}`,
              avatarUrl: picture || undefined,
              provider,
              providerId,
              upstreamProvider: upstream,
              createdAt: new Date().toISOString(),
            };
            await createUser(newUser);
            // createUser は SETNX で原子化済み (auth-redis.ts:88)。
            // newUser をそのまま使うことで Redis ラウンドトリップ -1 (50-150ms 削減)。
            user = newUser;
          } else if (picture && user.avatarUrl !== picture) {
            await updateAvatarUrl(user.id, picture);
            user.avatarUrl = picture;
          }

          token.tsuriId = user.id;
          token.nickname = user.nickname;
          token.avatarUrl = user.avatarUrl;
          token.provider = user.provider;
          token.upstreamProvider = user.upstreamProvider;
          token.isNewUser = !user.nicknameSetAt;
          token.reportCount = user.reportCount ?? 0;
        } catch (err) {
          console.error("[auth] jwt callback error (login):", err);
        }
      }

      if (trigger === "update" && token.tsuriId) {
        try {
          const fresh = await getUserById(token.tsuriId as string);
          if (fresh) {
            token.nickname = fresh.nickname;
            token.avatarUrl = fresh.avatarUrl;
            token.isNewUser = !fresh.nicknameSetAt;
            token.reportCount = fresh.reportCount ?? 0;
          }
        } catch (err) {
          console.error("[auth] jwt callback error (update):", err);
        }
        if (updateData && typeof updateData === "object" && "nickname" in updateData) {
          token.nickname = (updateData as { nickname: string }).nickname;
          token.isNewUser = false;
        }
      }
      return token;
    },

    session({ session, token }) {
      if (token.tsuriId) {
        session.user.tsuriId = token.tsuriId as string;
        session.user.nickname = (token.nickname as string) || "";
        session.user.avatarUrl = token.avatarUrl as string | undefined;
        session.user.provider = (token.provider as string) || "";
        session.user.upstreamProvider = token.upstreamProvider as string | undefined;
        session.user.isNewUser = Boolean(token.isNewUser);
        session.user.reportCount = (token.reportCount as number) ?? 0;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
