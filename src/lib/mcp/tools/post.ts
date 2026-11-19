// 釣果の下書き（draft_catch_report）
//
// 会話で聞いた釣果を、ツリスポの投稿確認ページの URL にまとめて返すだけのツール。
// このツール自体は何も保存・公開しない（読み取り専用）。公開されるのは、ユーザーが
// リンク先で内容を確かめ、写真を付けて「投稿する」を押したときだけ。
// 会話に貼られた写真はツールへ確実に渡せないため、写真は確認ページで添付してもらう。
import { checkNgWords } from "@/lib/moderation";
import { CATCH_METHODS, CATCH_WEATHERS, COMMENT_MAX, FISH_NAME_MAX, isCatchMethod, isCatchWeather } from "@/lib/catch-report-options";
import { buildDraftQuery, draftDate, draftSize, CATCH_DRAFT_PATH, type CatchDraft } from "../catch-draft";
import { todayJst } from "@/lib/ugc-validation";
import { ToolError, ToolInputError, type ToolDef, requireSpot, siteUrl, str } from "./shared";

export function draftCatchReport(args: Record<string, unknown>) {
  const spot = requireSpot(args);
  if (spot.fishingBan?.scope === "full") {
    throw new ToolError(`${spot.name} は現在釣り禁止のため、釣果の投稿を受け付けていません。`);
  }

  const fishName = str(args.fishName, 200);
  if (!fishName) throw new ToolInputError("fishName（釣れた魚の名前）を指定してください");
  if (fishName.length > FISH_NAME_MAX) throw new ToolInputError(`fishName は${FISH_NAME_MAX}文字以内にしてください`);

  let sizeCm: number | undefined;
  if (args.sizeCm !== undefined && args.sizeCm !== null && args.sizeCm !== "") {
    sizeCm = draftSize(args.sizeCm);
    if (sizeCm === undefined) throw new ToolInputError("sizeCm は 0 より大きく 300 以下の数値（cm）にしてください");
  }

  const method = str(args.method, 20);
  if (method !== undefined && !isCatchMethod(method)) {
    throw new ToolInputError(`method は次のいずれかにしてください: ${CATCH_METHODS.join("・")}（当てはまらなければ「その他」）`);
  }
  const weather = str(args.weather, 20);
  if (weather !== undefined && !isCatchWeather(weather)) {
    throw new ToolInputError(`weather は次のいずれかにしてください: ${CATCH_WEATHERS.join("・")}`);
  }

  let date = todayJst();
  const rawDate = str(args.date, 20);
  if (rawDate !== undefined) {
    const d = draftDate(rawDate);
    if (!d) throw new ToolInputError(`date は今日（${date}）以前の YYYY-MM-DD 形式にしてください`);
    date = d;
  }

  const comment = str(args.comment, 1000);
  if (comment !== undefined && comment.length > COMMENT_MAX) {
    throw new ToolInputError(`comment は${COMMENT_MAX}文字以内にしてください`);
  }

  const mod = checkNgWords([fishName, comment ?? ""]);
  if (!mod.ok) throw new ToolInputError(`${mod.reason}（魚名・ひとことを書き直してください）`);

  const draft: CatchDraft = { spot: spot.slug, fishName, sizeCm, method, weather, date, comment };
  return {
    status: "draft_not_posted",
    confirmUrl: siteUrl(`${CATCH_DRAFT_PATH}?${buildDraftQuery(draft)}`),
    draft: {
      spotName: spot.name,
      prefecture: spot.region.prefecture,
      fishName,
      sizeCm: sizeCm ?? null,
      method: method ?? null,
      weather: weather ?? null,
      date,
      comment: comment ?? null,
    },
    nextStep:
      "まだ投稿されていません。ユーザーに confirmUrl を開いてもらい、内容を確認して写真を付け、「投稿する」を押すと公開されます。" +
      "会話に貼られた写真は自動では付かないので、確認ページで選び直す必要があります。ログインしなくても投稿できます。",
  };
}

export const POST_TOOLS: ToolDef[] = [
  {
    name: "draft_catch_report",
    title: "釣果の投稿下書きを作る",
    description:
      "ユーザーが釣果をツリスポに投稿・記録したいときに使う。会話の内容から下書きを作り、投稿確認ページの URL（confirmUrl）を返す。" +
      "このツールだけでは投稿は完了せず、公開されるのはユーザーが確認ページで写真を付けて確定したときだけです。" +
      "slug は釣り場の識別子（ツリスポの URL でも可）。分からない項目は省略でき、確認ページで入力できます。" +
      "例: {\"slug\":\"daikoku-fishing-facility\",\"fishName\":\"アジ\",\"sizeCm\":22,\"method\":\"サビキ\",\"date\":\"2026-11-19\"}",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "釣り場の slug（search_spots の結果）。ツリスポの URL でも可" },
        fishName: { type: "string", maxLength: FISH_NAME_MAX, description: "釣れた魚の名前（例: アジ）。複数なら「アジ、サバ」" },
        sizeCm: { type: "number", exclusiveMinimum: 0, maximum: 300, description: "いちばん大きい魚のサイズ（cm）" },
        method: { type: "string", enum: [...CATCH_METHODS], description: "釣り方" },
        weather: { type: "string", enum: [...CATCH_WEATHERS], description: "天気" },
        date: { type: "string", description: "釣った日（YYYY-MM-DD、日本時間）。省略時は今日" },
        comment: { type: "string", maxLength: COMMENT_MAX, description: "ひとこと（100文字以内、任意）" },
      },
      required: ["slug", "fishName"],
      additionalProperties: false,
    },
    run: draftCatchReport,
    // 何も保存しないので読み取り専用・冪等（既定どおり）。日付の既定値だけ「今日」に依存する
  },
];
