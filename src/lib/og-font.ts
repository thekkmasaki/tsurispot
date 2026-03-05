// OGP画像生成用 Noto Sans JP フォントキャッシュ
// モジュールレベルでキャッシュし、Node.jsプロセス存続中は再取得しない
let cachedFont: ArrayBuffer | null = null;

export async function getOgFont(): Promise<ArrayBuffer | undefined> {
  if (cachedFont) return cachedFont;
  try {
    const fontRes = await fetch(
      "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap"
    );
    const css = await fontRes.text();
    const fontUrlMatch = css.match(/url\(([^)]+)\)/);
    if (fontUrlMatch) {
      const fontFileRes = await fetch(fontUrlMatch[1]);
      cachedFont = await fontFileRes.arrayBuffer();
      return cachedFont;
    }
  } catch {
    // フォント取得失敗時はデフォルトフォント
  }
  return undefined;
}
