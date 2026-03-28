import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import type { OAuthConfig } from "next-auth/providers";
import { getUserByProvider, getUserById, createUser } from "@/lib/auth-redis";

/**
 * LINE Login プロバイダー（Auth.js v5 OAuth）
 * OIDC discovery との競合を避けるため type: "oauth" で手動エンドポイント指定
 */
interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

function LineProvider(): OAuthConfig<LineProfile> {
  return {
    id: "line",
    name: "LINE",
    type: "oauth",
    authorization: {
      url: "https://access.line.me/oauth2/v2.1/authorize",
      params: { scope: "profile" },
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
    error: "/login",
  },
  callbacks: {
    async signIn({ account, user }) {
      // account.providerAccountId = LINE user ID（Auth.js内部で profile().id から設定）
      // 注意: user.id はAuth.jsが生成するランダムUUIDであり、LINE IDではない
      if (!account?.providerAccountId) return false;
      const provider = account.provider;
      const providerId = account.providerAccountId;

      const existing = await getUserByProvider(provider, providerId);

      if (!existing) {
        const tsuriId = crypto.randomUUID();
        await createUser({
          id: tsuriId,
          nickname: user.name || `釣り人${tsuriId.slice(0, 6)}`,
          avatarUrl: user.image || undefined,
          provider,
          providerId,
          createdAt: new Date().toISOString(),
        });
      } else if (user.image && existing.avatarUrl !== user.image) {
        existing.avatarUrl = user.image;
        const { redis } = await import("@/lib/redis");
        await redis.set(`auth:user:${existing.id}`, existing);
      }
      return true;
    },

    async jwt({ token, account, trigger, session: updateData }) {
      // 新規ログイン時: Auth.jsが生成するdefaultTokenは常に新規オブジェクト
      // （name, email, picture, sub のみ）なので旧セッションデータは含まれない。
      // ただし安全のため明示的にクリアする。
      if (account?.providerAccountId) {
        token.tsuriId = undefined;
        token.nickname = undefined;
        token.avatarUrl = undefined;
        token.provider = undefined;
        token.isNewUser = undefined;

        const existing = await getUserByProvider(
          account.provider,
          account.providerAccountId,
        );
        if (existing) {
          token.tsuriId = existing.id;
          token.nickname = existing.nickname;
          token.avatarUrl = existing.avatarUrl;
          token.provider = existing.provider;
          token.isNewUser = !existing.nicknameSetAt;
        }
      }
      // セッション更新時（ニックネーム変更など）にRedisから最新データを再取得
      if (trigger === "update" && token.tsuriId) {
        const fresh = await getUserById(token.tsuriId as string);
        if (fresh) {
          token.nickname = fresh.nickname;
          token.avatarUrl = fresh.avatarUrl;
          token.isNewUser = !fresh.nicknameSetAt;
        }
        // クライアントからのニックネーム更新を優先（Redis反映のタイミングずれ対策）
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
        session.user.isNewUser = Boolean(token.isNewUser);
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
