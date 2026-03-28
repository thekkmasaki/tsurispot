import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import type { OIDCConfig } from "next-auth/providers";
import { getUserByProvider, createUser } from "@/lib/auth-redis";

/**
 * LINE Login プロバイダー（Auth.js v5 カスタム）
 * LINE Login は OpenID Connect 準拠だが Auth.js 組み込みではないため手動定義
 */
interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

function LineProvider(): OIDCConfig<LineProfile> {
  return {
    id: "line",
    name: "LINE",
    type: "oidc",
    issuer: "https://access.line.me",
    authorization: {
      url: "https://access.line.me/oauth2/v2.1/authorize",
      params: { scope: "profile openid" },
    },
    token: "https://api.line.me/oauth2/v2.1/token",
    userinfo: "https://api.line.me/v2/profile",
    clientId: process.env.AUTH_LINE_ID,
    clientSecret: process.env.AUTH_LINE_SECRET,
    profile(profile) {
      return {
        id: profile.userId,
        name: profile.displayName,
        image: profile.pictureUrl,
      };
    },
    checks: ["state"],
  };
}

const config: NextAuthConfig = {
  providers: [LineProvider()],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30日
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!account || !user.id) return false;
      const provider = account.provider;
      const providerId = user.id;

      // 既存ユーザーチェック
      const existing = await getUserByProvider(provider, providerId);
      if (!existing) {
        // 新規ユーザー作成
        const tsuriId = crypto.randomUUID();
        await createUser({
          id: tsuriId,
          nickname: user.name || `釣り人${tsuriId.slice(0, 6)}`,
          avatarUrl: user.image || undefined,
          provider,
          providerId,
          createdAt: new Date().toISOString(),
        });
      }
      return true;
    },

    async jwt({ token, account, user }) {
      // 初回ログイン時にトークンにTsuriSpot情報を埋め込み
      if (account && user?.id) {
        const existing = await getUserByProvider(
          account.provider,
          user.id,
        );
        if (existing) {
          token.tsuriId = existing.id;
          token.nickname = existing.nickname;
          token.avatarUrl = existing.avatarUrl;
          token.provider = existing.provider;
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
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
