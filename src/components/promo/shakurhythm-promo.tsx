import { Smartphone, Watch, Vibrate, Timer, Sunrise, Check } from "lucide-react";

const APP_STORE_URL = "https://apps.apple.com/jp/app/id6825799808";

/** iPhone/Apple Watch 向けエギング用アプリ「シャクリズム」の紹介カード（ツリスポ運営アプリ） */
export function ShakurhythmPromo({ source = "guide" }: { source?: string }) {
  return (
    <aside className="rounded-xl border border-primary/30 bg-primary/5 p-5 sm:p-6">
      <p className="text-xs font-semibold text-primary">ツリスポ公式アプリ｜iPhone・Apple Watch｜無料</p>
      <h2 className="mt-1 text-lg font-bold sm:text-xl">
        シャクリズム｜振動でシャクるエギング用タイマー
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        底をとったら「シャクリ開始」を1回押すだけ。フォールの秒数はアプリが数えて、終わるたびに振動で知らせます。
        沈めている間は振動しないので、手元とラインに集中して、アタリを逃しません。
      </p>
      <ul className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <li className="flex items-start gap-2">
          <Vibrate className="mt-0.5 size-4 shrink-0 text-primary" />
          ロック中・ポケットの中でも振動で合図
        </li>
        <li className="flex items-start gap-2">
          <Timer className="mt-0.5 size-4 shrink-0 text-primary" />
          「秋・2段シャクリ」など今日の型を自動で提案。フォール秒数は1秒単位で調整OK
        </li>
        <li className="flex items-start gap-2">
          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
          エギの号数（2.5〜4.0号）と沈下速度タイプを選ぶだけで秒数を設定
        </li>
        <li className="flex items-start gap-2">
          <Watch className="mt-0.5 size-4 shrink-0 text-primary" />
          Apple Watchならキャストを手首で自動検知
        </li>
        <li className="flex items-start gap-2">
          <Sunrise className="mt-0.5 size-4 shrink-0 text-primary" />
          朝マヅメまでの時間や潮もホームで確認
        </li>
        <li className="flex items-start gap-2">
          <Smartphone className="mt-0.5 size-4 shrink-0 text-primary" />
          登録不要・無料で使えます
        </li>
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={`${APP_STORE_URL}?ct=tsurispot_${source}`}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          App Storeで無料ダウンロード
        </a>
        <a href="/shakurhythm/support.html" className="text-sm text-primary hover:underline">
          使い方・サポート
        </a>
      </div>
    </aside>
  );
}
