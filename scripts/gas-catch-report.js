/**
 * Google Apps Script - TsuriSpot 釣果報告 Webhook
 *
 * 【セットアップ手順】
 * 1. Google Sheets で新しいスプレッドシートを作成
 *    - シート名を「釣果報告」に変更
 *    - 1行目にヘッダー: 受信日時 | スポット名 | スポットSlug | 釣った魚 | ユーザー名 | コメント | 釣った日 | URL | 承認
 *
 * 2. 拡張機能 > Apps Script を開く
 *
 * 3. このファイルの内容を貼り付け
 *
 * 4. SPREADSHEET_ID を自分のスプレッドシートIDに変更
 *    （URLの /d/ と /edit の間の文字列）
 *
 * 5. デプロイ > 新しいデプロイ
 *    - 種類: ウェブアプリ
 *    - 実行者: 自分
 *    - アクセス: 全員
 *    → デプロイURLをコピー
 *
 * 6. Vercel環境変数に追加:
 *    GAS_CATCH_REPORT_URL=https://script.google.com/macros/s/XXXXX/exec
 */

// === 設定 ===
const SPREADSHEET_ID = "1FEYIuiTxuGobXA9ZXCaryaQ8Z-LrrbqvXlzuz4OvfKw";
const SHEET_NAME = "釣果報告";
const NOTIFY_EMAIL = "fishingspotjapan@gmail.com";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // スプレッドシートに保存
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        "受信日時", "スポット名", "スポットSlug", "釣った魚",
        "ユーザー名", "コメント", "釣った日", "スポットURL", "承認"
      ]);
      // ヘッダー太字
      sheet.getRange(1, 1, 1, 9).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    // データ追加
    sheet.appendRow([
      new Date().toLocaleString("ja-JP"),
      data.spotName || "",
      data.spotSlug || "",
      data.fishName || "",
      data.userName || "",
      data.comment || "",
      data.date || "",
      data.spotUrl || "",
      "未承認"
    ]);

    // メール通知
    var subject = "【ツリスポ】新しい釣果報告: " + (data.fishName || "不明") + " @ " + (data.spotName || "不明");
    var body = [
      "新しい釣果報告が投稿されました！",
      "",
      "━━━━━━━━━━━━━━━━━━━━",
      "スポット: " + (data.spotName || "不明"),
      "釣った魚: " + (data.fishName || "不明"),
      "ユーザー: " + (data.userName || "匿名"),
      "コメント: " + (data.comment || "なし"),
      "釣った日: " + (data.date || "不明"),
      "━━━━━━━━━━━━━━━━━━━━",
      "",
      "スポットページ: " + (data.spotUrl || ""),
      "スプレッドシート: https://docs.google.com/spreadsheets/d/" + SPREADSHEET_ID,
      "",
      "承認するにはスプレッドシートの「承認」列を「承認済み」に変更してください。"
    ].join("\n");

    MailApp.sendEmail(NOTIFY_EMAIL, subject, body);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// GET リクエスト（テスト用）
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "ok", message: "TsuriSpot Catch Report Webhook is active" })
  ).setMimeType(ContentService.MimeType.JSON);
}
