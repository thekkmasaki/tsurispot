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
 * 6. App Runner 環境変数に追加:
 *    GAS_CATCH_REPORT_URL=https://script.google.com/macros/s/XXXXX/exec
 *
 * 7. （推奨）共有キー: プロジェクトの設定 > スクリプト プロパティに SHARED_KEY を追加し、
 *    同じ値を App Runner の GAS_SHARED_KEY に設定する。SHARED_KEY が設定されていると、
 *    キー（data.k）が一致しない POST はシート記録・メール送信をせずに拒否する。
 *    手順の詳細: docs/gas-update-2026-11.md
 */

// === 設定 ===
const SPREADSHEET_ID = "1FEYIuiTxuGobXA9ZXCaryaQ8Z-LrrbqvXlzuz4OvfKw";
const SHEET_NAME = "釣果報告";
const SHOP_SHEET_NAME = "店舗掲載申請";
const BASIC_INQUIRY_SHEET = "ベーシック問い合わせ";
const PRO_INQUIRY_SHEET = "プロ問い合わせ";
const NOTIFY_EMAIL = "fishingspotjapan@gmail.com";

// スプレッドシートの数式インジェクション対策。
// = + - @ タブ CR で始まる文字列はセルに数式として解釈されうるため、先頭に ' を付けて文字列として保存する。
// ユーザー由来の値は appendRow する前に必ずこれを通すこと。
function safe(v) {
  if (v === null || v === undefined) return "";
  var s = typeof v === "string" ? v : String(v);
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

// 定数時間の文字列比較（共有キー照合用）
function safeEqualStr(a, b) {
  a = String(a);
  b = String(b);
  var diff = a.length ^ b.length;
  for (var i = 0; i < b.length; i++) {
    diff |= (i < a.length ? a.charCodeAt(i) : 0) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

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

    // 共有キー照合（Script Property SHARED_KEY が設定されている場合のみ）。
    // 不一致ならシート記録・メール送信をせずに拒否する。
    var sharedKey = PropertiesService.getScriptProperties().getProperty("SHARED_KEY");
    if (sharedKey && !(typeof data.k === "string" && safeEqualStr(data.k, sharedKey))) {
      return jsonOut({ ok: false, error: "unauthorized" });
    }
    delete data.k;

    // type で分岐
    if (data.type === "shop_listing") {
      return handleShopListing(data);
    }
    if (data.type === "paid_inquiry_basic" || data.type === "paid_inquiry_pro") {
      return handlePaidInquiry(data);
    }
    if (data.type === "contact") {
      return handleContact(data);
    }
    // 釣果の本体（魚名もスポット名も無い）が無いものは釣果報告として扱わない
    if (!data.fishName && !data.spotName) {
      return ContentService.createTextOutput(
        JSON.stringify({ ok: false, error: "empty report" })
      ).setMimeType(ContentService.MimeType.JSON);
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
    safe(data.spotName),
    safe(data.spotSlug),
    safe(data.fishName),
    safe(data.userName),
    safe(data.comment),
    safe(data.date),
    safe(data.spotUrl),
    "自動公開済み"
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
    "※この投稿はサイトに自動公開済みです（スポット詳細ページ＋トップの「みんなの最近の釣果」に反映）。",
    "　スプレッドシートは記録・バックアップ用です。不適切な投稿はサイト上の「通報」または開発者にご連絡ください。"
  ].join("\n");

  MailApp.sendEmail(NOTIFY_EMAIL, subject, body);

  return ContentService.createTextOutput(
    JSON.stringify({ ok: true })
  ).setMimeType(ContentService.MimeType.JSON);
}

// === お問い合わせ ===
var CONTACT_SHEET_NAME = "お問い合わせ";
function handleContact(data) {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CONTACT_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(CONTACT_SHEET_NAME);
    sheet.appendRow(["受信日時", "名前", "メール", "種別", "内容", "対応"]);
    sheet.getRange(1, 1, 1, 6).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([
    new Date().toLocaleString("ja-JP"),
    safe(data.name),
    safe(data.email),
    safe(data.category),
    safe(data.message),
    "未対応"
  ]);

  var subject = "【ツリスポ】お問い合わせ: " + (data.category || "一般") + "（" + (data.name || "名前なし") + "）";
  var body = [
    "お問い合わせが届きました。",
    "",
    "名前: " + (data.name || ""),
    "メール: " + (data.email || ""),
    "種別: " + (data.category || ""),
    "",
    safe(data.message),
    "",
    "スプレッドシート: https://docs.google.com/spreadsheets/d/" + SPREADSHEET_ID
  ].join("\n");
  var opts = {};
  if (data.email) opts.replyTo = data.email;
  MailApp.sendEmail(NOTIFY_EMAIL, subject, body, opts);

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
    safe(data.shopName),
    safe(data.address),
    safe(data.phone),
    safe(data.businessHours),
    safe(data.closedDays),
    safe(data.services),
    safe(data.nearbySpots),
    safe(data.email),
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
    safe(data.shopName),
    safe(data.contactName),
    safe(data.email),
    safe(data.phone),
    safe(data.message),
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
