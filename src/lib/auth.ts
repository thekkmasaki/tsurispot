import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Cognito from "next-auth/providers/cognito";
import { getUserByProvider, getUserById, createUser, updateAvatarUrl } from "@/lib/auth-redis";

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

const config: NextAuthConfig = {
  // App Runner / CloudFront 経由のため、Host ヘッダーを信頼してよい。
  // AUTH_URL/AUTH_TRUST_HOST/VERCEL いずれも未設定の本番では trustHost が
  // false になり Configuration error → /login?error=Configuration に飛ぶ。
  trustHost: true,
  providers: [
    Cognito({
      clientId: process.env.COGNITO_CLIENT_ID,
      clientSecret: process.env.COGNITO_CLIENT_SECRET,
      issuer: process.env.COGNITO_ISSUER,
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

        console.log(`[auth] login: provider=${provider}, sub=${providerId}, upstream=${upstream}`);

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
            console.log(`[auth] created user tsuriId=${user.id}`);
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
