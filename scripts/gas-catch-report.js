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
const SHOP_SHEET_NAME = "店舗掲載申請";
const BASIC_INQUIRY_SHEET = "ベーシック問い合わせ";
const PRO_INQUIRY_SHEET = "プロ問い合わせ";
const NOTIFY_EMAIL = "fishingspotjapan@gmail.com";

// UTF-8バイト列として解釈し直す（GASがLatin-1でデコードした場合の修正）
function forceUTF8(str) {
  try {
    var bytes = [];
    for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      if (c <= 0xff) {
        bytes.push(c);
      } else {
        // 既にUnicodeの場合はそのまま返す（修正不要）
        return str;
      }
    }
    return Utilities.newBlob(bytes).getDataAsString("UTF-8");
  } catch (err) {
    return str;
  }
}

function doPost(e) {
  try {
    var raw = e.postData.contents;

    // デバッグモード: type=echo のときは受信データをそのまま返す
    // これでエンコーディング問題の切り分けができる
    try {
      var peek = JSON.parse(raw);
      if (peek.type === "echo") {
        return ContentService.createTextOutput(
          JSON.stringify({
            ok: true,
            rawLength: raw.length,
            rawFirst100: raw.substring(0, 100),
            parsed: peek,
            charCodes: raw.substring(0, 30).split("").map(function(c) { return c.charCodeAt(0); })
          })
        ).setMimeType(ContentService.MimeType.JSON);
      }
    } catch (ignored) {}

    // 通常パース: まずそのまま試す
    var data = JSON.parse(raw);

    // もし全文字が0xFF以下（Latin-1っぽい）ならUTF-8として再解釈
    var testVal = data.fishName || data.shopName || "";
    var needsFixing = false;
    for (var i = 0; i < testVal.length; i++) {
      if (testVal.charCodeAt(i) > 0x7f && testVal.charCodeAt(i) <= 0xff) {
        needsFixing = true;
        break;
      }
    }

    if (needsFixing) {
      // rawをUTF-8として再解釈
      var fixed = forceUTF8(raw);
      data = JSON.parse(fixed);
    }

    // type で分岐
    if (data.type === "shop_listing") {
      return handleShopListing(data);
    }
    if (data.type === "paid_inquiry_basic" || data.type === "paid_inquiry_pro") {
      return handlePaidInquiry(data);
    }
    return handleCatchReport(data);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// === 釣果報告 ===
function handleCatchReport(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      "受信日時", "スポット名", "スポットSlug", "釣った魚",
      "ユーザー名", "コメント", "釣った日", "スポットURL", "承認"
    ]);
    sheet.getRange(1, 1, 1, 9).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

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
}

// === 店舗掲載申請 ===
function handleShopListing(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHOP_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHOP_SHEET_NAME);
    sheet.appendRow([
      "受信日時", "店舗名", "住所", "電話番号", "営業時間",
      "定休日", "サービス", "近くの釣りポイント", "連絡先メール", "ステータス"
    ]);
    sheet.getRange(1, 1, 1, 10).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date().toLocaleString("ja-JP"),
    data.shopName || "",
    data.address || "",
    data.phone || "",
    data.businessHours || "",
    data.closedDays || "",
    data.services || "",
    data.nearbySpots || "",
    data.email || "",
    "未対応"
  ]);

  var subject = "【ツリスポ】新しい店舗掲載申請: " + (data.shopName || "不明");
  var body = [
    "新しい店舗掲載申請がありました！",
    "",
    "━━━━━━━━━━━━━━━━━━━━",
    "店舗名: " + (data.shopName || "不明"),
    "住所: " + (data.address || "不明"),
    "電話番号: " + (data.phone || "未記入"),
    "営業時間: " + (data.businessHours || "未記入"),
    "定休日: " + (data.closedDays || "未記入"),
    "サービス: " + (data.services || "未記入"),
    "近くの釣りポイント: " + (data.nearbySpots || "未記入"),
    "連絡先: " + (data.email || "未記入"),
    "━━━━━━━━━━━━━━━━━━━━",
    "",
    "スプレッドシート: https://docs.google.com/spreadsheets/d/" + SPREADSHEET_ID,
  ].join("\n");

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);

  return ContentService.createTextOutput(
    JSON.stringify({ ok: true })
  ).setMimeType(ContentService.MimeType.JSON);
}

// === 有料プラン問い合わせ ===
function handlePaidInquiry(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var isBasic = data.type === "paid_inquiry_basic";
  var sheetName = isBasic ? BASIC_INQUIRY_SHEET : PRO_INQUIRY_SHEET;
  var planName = isBasic ? "ベーシック" : "プロ";
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow([
      "受信日時", "店舗名", "ご担当者名", "メールアドレス",
      "電話番号", "ご質問・ご要望", "ステータス"
    ]);
    sheet.getRange(1, 1, 1, 7).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }

  sheet.appendRow([
    new Date().toLocaleString("ja-JP"),
    data.shopName || "",
    data.contactName || "",
    data.email || "",
    data.phone || "",
    data.message || "",
    "未対応"
  ]);

  var subject = "【ツリスポ】" + planName + "プラン問い合わせ: " + (data.shopName || "不明");
  var body = [
    planName + "プランの問い合わせがありました！",
    "",
    "━━━━━━━━━━━━━━━━━━━━",
    "プラン: " + planName + (isBasic ? "（初年度 月額500円）" : "（初年度 月額1,980円）"),
    "店舗名: " + (data.shopName || "不明"),
    "ご担当者名: " + (data.contactName || "未記入"),
    "メール: " + (data.email || "未記入"),
    "電話番号: " + (data.phone || "未記入"),
    "ご質問・ご要望: " + (data.message || "なし"),
    "━━━━━━━━━━━━━━━━━━━━",
    "",
    "スプレッドシート: https://docs.google.com/spreadsheets/d/" + SPREADSHEET_ID,
  ].join("\n");

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);

  return ContentService.createTextOutput(
    JSON.stringify({ ok: true })
  ).setMimeType(ContentService.MimeType.JSON);
}

// GET リクエスト — 承認済み釣果データをJSON返却
// ?spot=azure-maiko でスポット別フィルタ、パラメータなしなら全承認済み
function doGet(e) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet || sheet.getLastRow() <= 1) {
      return ContentService.createTextOutput(
        JSON.stringify({ ok: true, reports: [] })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var data = sheet.getDataRange().getValues();
    var headers = data[0];
    var spotSlugCol = headers.indexOf("スポットSlug");
    var approvalCol = headers.indexOf("承認");

    if (spotSlugCol === -1 || approvalCol === -1) {
      return ContentService.createTextOutput(
        JSON.stringify({ ok: false, error: "ヘッダーが見つかりません" })
      ).setMimeType(ContentService.MimeType.JSON);
    }

    var spotFilter = e && e.parameter && e.parameter.spot ? e.parameter.spot : null;
    var reports = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (row[approvalCol] !== "承認済み") continue;
      if (spotFilter && row[spotSlugCol] !== spotFilter) continue;

      reports.push({
        id: "gas-" + i,
        date: row[0] ? row[0].toString() : "",
        spotName: row[1] || "",
        spotSlug: row[2] || "",
        fishName: row[3] || "",
        userName: row[4] || "",
        comment: row[5] || "",
        catchDate: row[6] || "",
        approved: true
      });
    }

    // 新しい順にソート
    reports.sort(function(a, b) {
      return b.catchDate.localeCompare(a.catchDate);
    });

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, reports: reports })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
