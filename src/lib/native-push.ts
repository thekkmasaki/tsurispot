/**
 * iOS/Android ネイティブアプリ（Capacitor）向けの APNs/FCM プッシュ登録。
 *
 * Web の web-push（VAPID, notification-subscribe-button.tsx）とは別経路。
 * ネイティブ時はこちらで端末トークンを取得し `/api/notification/subscribe-native`
 * に保存する。プラグインは dynamic import で Web バンドルに混入させない。
 */
import { isNativeApp } from "./platform";

export type NativePushResult = {
  ok: boolean;
  token?: string;
  error?: string;
};

/**
 * 通知許可を求め、端末トークンを取得してサーバーに保存する。
 * Web ブラウザ上では何もせず { ok:false, error:"not-native" } を返す。
 */
export async function registerNativePush(): Promise<NativePushResult> {
  if (!isNativeApp()) return { ok: false, error: "not-native" };

  let plugin: typeof import("@capacitor/push-notifications");
  try {
    plugin = await import("@capacitor/push-notifications");
  } catch (e) {
    return { ok: false, error: `plugin-load: ${(e as Error).message}` };
  }
  const { PushNotifications } = plugin;

  try {
    const perm = await PushNotifications.requestPermissions();
    if (perm.receive !== "granted") {
      return { ok: false, error: "permission-denied" };
    }
  } catch (e) {
    return { ok: false, error: `permission: ${(e as Error).message}` };
  }

  return new Promise<NativePushResult>((resolve) => {
    const handles: Array<{ remove: () => Promise<void> }> = [];
    let done = false;
    const finish = (r: NativePushResult) => {
      if (done) return;
      done = true;
      handles.forEach((h) => {
        void h.remove().catch(() => {});
      });
      resolve(r);
    };

    void PushNotifications.addListener("registration", async (token) => {
      try {
        const res = await fetch("/api/notification/subscribe-native", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: token.value }),
        });
        finish({
          ok: res.ok,
          token: token.value,
          error: res.ok ? undefined : "save-failed",
        });
      } catch (e) {
        finish({ ok: false, error: (e as Error).message });
      }
    }).then((h) => handles.push(h));

    void PushNotifications.addListener("registrationError", (err) => {
      finish({ ok: false, error: err?.error || "registration-error" });
    }).then((h) => handles.push(h));

    // 端末/ネットワーク要因で event が来ないケースの保険
    setTimeout(() => finish({ ok: false, error: "timeout" }), 10000);

    void PushNotifications.register().catch((e: unknown) =>
      finish({ ok: false, error: `register: ${(e as Error).message}` }),
    );
  });
}

/**
 * 通知タップ時に payload の url へ遷移するハンドラを登録する。
 * アプリ起動時に一度だけ呼ぶ（NativeBootstrap から）。
 */
export async function initPushTapHandling(): Promise<void> {
  if (!isNativeApp()) return;
  try {
    const { PushNotifications } = await import("@capacitor/push-notifications");
    await PushNotifications.addListener(
      "pushNotificationActionPerformed",
      (action) => {
        const url = (action?.notification?.data as { url?: string } | undefined)
          ?.url;
        if (url && typeof url === "string") {
          window.location.assign(url);
        }
      },
    );
  } catch {
    /* プラグイン未ロード時は何もしない */
  }
}
