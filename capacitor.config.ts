import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.tsurispot.app",
  appName: "ツリスポ",
  // Next.js の SSR を WebView で包む方針。webDir は Capacitor の必須項目だが、
  // server.url 設定により実際は本番 URL を直接読む（ネイティブ更新無しでWeb即時反映）
  webDir: "public",
  server: {
    url:
      process.env.CAP_SERVER_URL ||
      (process.env.NODE_ENV === "production"
        ? "https://tsurispot.com"
        : "http://localhost:3000"),
    cleartext: true,
  },
  ios: {
    contentInset: "automatic",
    backgroundColor: "#0369a1",
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    SignInWithApple: {
      // Apple Developer 登録後、Service ID をここに設定
      // clientId: "jp.tsurispot.signin",
    },
  },
};

export default config;
