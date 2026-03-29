import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import type { OAuthConfig } from "next-auth/providers";
import { getUserByProvider, getUserById, createUser, updateAvatarUrl } from "@/lib/auth-redis";

/**
 * LINE Login プロバイダー（Auth.js v5 OAuth）
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
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ account, user }) {
      // 重要: user.id はAuth.jsが生成するランダムUUID。絶対に使わない。
      // account.providerAccountId がLINEの実際のユーザーID。
      if (!account?.providerAccountId) return false;

      const provider = account.provider;
      const providerId = account.providerAccountId;

      console.log(`[auth] signIn: provider=${provider}, providerId=${providerId}, userName=${user.name}`);

      try {
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
          console.log(`[auth] Created new user: tsuriId=${tsuriId}`);
        } else {
          console.log(`[auth] Existing user found: tsuriId=${existing.id}, nickname=${existing.nickname}`);
          // アバター更新（変わっていれば）
          if (user.image && existing.avatarUrl !== user.image) {
            await updateAvatarUrl(existing.id, user.image);
          }
        }
        return true;
      } catch (err) {
        console.error("[auth] signIn callback error:", err);
        // Redis障害でもログインは許可する（セッションにデータがない状態になるだけ）
        return true;
      }
    },

    async jwt({ token, account, trigger, session: updateData }) {
      // 新規ログイン時
      if (account?.providerAccountId) {
        // 旧セッションデータを明示的にクリア（別アカウント混入防止）
        token.tsuriId = undefined;
        token.nickname = undefined;
        token.avatarUrl = undefined;
        token.provider = undefined;
        token.isNewUser = undefined;

        try {
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
            console.log(`[auth] jwt: loaded user ${existing.id} (${existing.nickname})`);
          } else {
            console.warn(`[auth] jwt: user not found for ${account.provider}:${account.providerAccountId}`);
          }
        } catch (err) {
          console.error("[auth] jwt callback error (login):", err);
        }
      }

      // セッション更新時（ニックネーム変更など）
      if (trigger === "update" && token.tsuriId) {
        try {
          const fresh = await getUserById(token.tsuriId as string);
          if (fresh) {
            token.nickname = fresh.nickname;
            token.avatarUrl = fresh.avatarUrl;
            token.isNewUser = !fresh.nicknameSetAt;
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
        session.user.isNewUser = Boolean(token.isNewUser);
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
