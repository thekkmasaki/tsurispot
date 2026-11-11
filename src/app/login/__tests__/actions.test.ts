import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("next-auth", () => ({ AuthError: class AuthError extends Error {} }));
vi.mock("@/lib/auth", () => ({ signIn: vi.fn() }));
vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ get: () => undefined })),
}));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { signIn } from "@/lib/auth";
import { loginWithApple, loginWithGoogle } from "../actions";
import { authorizeParamsFor, isAppleLoginEnabled } from "@/lib/apple-login";

describe("Sign in with Apple の機能スイッチ", () => {
  const saved = { apple: process.env.APPLE_LOGIN_ENABLED, link: process.env.APP_LINK_ENABLED };
  beforeEach(() => {
    vi.mocked(signIn).mockReset();
    delete process.env.APP_LINK_ENABLED;
  });
  afterEach(() => {
    if (saved.apple === undefined) delete process.env.APPLE_LOGIN_ENABLED;
    else process.env.APPLE_LOGIN_ENABLED = saved.apple;
    if (saved.link === undefined) delete process.env.APP_LINK_ENABLED;
    else process.env.APP_LINK_ENABLED = saved.link;
  });

  it('"true" の時だけ有効', () => {
    delete process.env.APPLE_LOGIN_ENABLED;
    expect(isAppleLoginEnabled()).toBe(false);
    process.env.APPLE_LOGIN_ENABLED = "1";
    expect(isAppleLoginEnabled()).toBe(false);
    process.env.APPLE_LOGIN_ENABLED = "true";
    expect(isAppleLoginEnabled()).toBe(true);
  });

  it("無効時は identity_provider を付けない（従来どおり）", () => {
    expect(authorizeParamsFor("google", false)).toBeUndefined();
    expect(authorizeParamsFor("apple", false)).toBeUndefined();
  });

  it("有効時は押したボタンの IdP を明示する", () => {
    expect(authorizeParamsFor("google", true)).toEqual({ identity_provider: "Google" });
    expect(authorizeParamsFor("apple", true)).toEqual({ identity_provider: "SignInWithApple" });
  });

  it("Apple 無効時、Google ログインは従来と同じ引数で signIn する", async () => {
    delete process.env.APPLE_LOGIN_ENABLED;
    await loginWithGoogle();
    expect(signIn).toHaveBeenCalledTimes(1);
    expect(vi.mocked(signIn).mock.calls[0]).toEqual(["cognito", { redirectTo: "/mypage" }]);
  });

  it("Apple 無効時、Apple の action は signIn せず /login へ戻す", async () => {
    delete process.env.APPLE_LOGIN_ENABLED;
    await expect(loginWithApple()).rejects.toThrow("REDIRECT:/login");
    expect(signIn).not.toHaveBeenCalled();
  });

  it("Apple 有効時、Apple の action は SignInWithApple を指定して signIn する", async () => {
    process.env.APPLE_LOGIN_ENABLED = "true";
    await loginWithApple();
    expect(vi.mocked(signIn).mock.calls[0]).toEqual([
      "cognito",
      { redirectTo: "/mypage" },
      { identity_provider: "SignInWithApple" },
    ]);
  });

  it("Apple 有効時、Google の action は Google を指定する（Cognito の選択画面を挟まない）", async () => {
    process.env.APPLE_LOGIN_ENABLED = "true";
    await loginWithGoogle();
    expect(vi.mocked(signIn).mock.calls[0]).toEqual([
      "cognito",
      { redirectTo: "/mypage" },
      { identity_provider: "Google" },
    ]);
  });
});
