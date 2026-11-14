// 釣果ページ・週報記事に置く LINE 友だち追加の案内（サーバーコンポーネント）。
// 一斉配信はしない（友だち数×1通で無料枠を超える）ので「毎週届く」とは書かない。
// 「釣果」「魚の名前」を送ると最新の週報から返信する機能（/api/line-webhook）への誘導。
const LINE_URL = process.env.NEXT_PUBLIC_LINE_ADD_FRIEND_URL;

export function LineChoukaCta({ className = "" }: { className?: string }) {
  if (!LINE_URL) return null;
  return (
    <aside
      aria-label="LINEで最新釣果を受け取る"
      className={`rounded-2xl border border-[#06c755]/40 bg-[#06c755]/5 p-4 sm:p-5 ${className}`}
    >
      <p className="text-base font-bold">LINEで今週の釣果をすぐチェック</p>
      <p className="mt-1 text-sm text-muted-foreground">
        友だち追加して「釣果」と送ると、あなたのエリアの最新釣果が届きます。
        「アジ」「タチウオ」など魚の名前を送ると、今その魚が釣れている場所がわかります。
      </p>
      <a
        href={LINE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white shadow-sm"
        style={{ backgroundColor: "#06c755" }}
      >
        LINEで友だち追加（無料）
      </a>
    </aside>
  );
}
