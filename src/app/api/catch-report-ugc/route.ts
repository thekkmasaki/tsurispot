import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { purgeCloudflareUrls } from "@/lib/cloudflare";
import { dbGet, dbPut } from "@/lib/dynamodb";
import { redis } from "@/lib/redis";
import { checkNgWords } from "@/lib/moderation";
import { auth } from "@/lib/auth";
import { incrementReportCount } from "@/lib/user-store";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { savePostMeta, addToGlobalFeed, sanitizeTags, addTagsForPost } from "@/lib/social-store";
import { fishSpecies } from "@/lib/data/fish";
import { getSpotBySlug } from "@/lib/data/spots";
import type { PostCatchResult } from "@/lib/catch-result";

const GAS_WEBHOOK_URL = process.env.GAS_CATCH_REPORT_URL;

// TTL: 365日
const TTL_SECONDS = 365 * 24 * 60 * 60;

interface CatchReport {
  id: string;
  spotSlug: string;
  spotName: string;
  fishName: string;
  userName: string;
  tsuriId?: string;
  comment: string;
  date: string;
  approved: boolean;
  photoUrl?: string;
  sizeCm?: number;
  method?: string;
  weather?: string;
  submittedAt?: string;
  tags?: string[];
  /** スポット初投稿（開拓者）。バッジ集計・一覧の🏴表示に使う */
  pioneer?: boolean;
}

/** スポット開拓者の永続レコード（SPOT#{slug}/PIONEER・TTLなし） */
interface SpotPioneer {
  userName: string;
  tsuriId?: string;
  date: string;
  reportId: string;
  at: string;
}

// 「アジ、サバ」のような複数魚種入力を分割（catch-feedback.ts と同じ区切り文字）
function splitFishNames(fishName: string): string[] {
  return fishName
    .split(/[、,・/／]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseReports(raw: unknown[]): CatchReport[] {
  return (raw || [])
    .map((item) => {
      if (typeof item === "string") {
        try {
          return JSON.parse(item) as CatchReport;
        } catch {
          return null;
        }
      }
      return item as CatchReport;
    })
    .filter((r): r is CatchReport => Boolean(r));
}

// POST: ユーザー釣果投稿を受け取る
export async function POST(request: Request) {
  try {
    const session = await auth();
    const tsuriId = session?.user?.tsuriId;

    // レート制限（匿名自動公開のため、スパム/荒らしによるトップ表示汚染を防ぐ）: 1IP 10分間に 10 投稿まで
    if (!(await checkRateLimit(getClientIp(request), "CATCH_REPORT_UGC", 10, 600))) {
      return NextResponse.json(
        { error: "投稿が多すぎます。しばらくしてからお試しください。" },
        { status: 429 },
      );
    }

    const body = await request.json().catch(() => ({}));
    const { spotSlug, spotName, fishName, userName, comment, date, photoUrl, sizeCm, method, weather, tags } = body as {
      spotSlug?: string;
      spotName?: string;
      fishName?: string;
      userName?: string;
      comment?: string;
      date?: string;
      photoUrl?: string;
      sizeCm?: number;
      method?: string;
      weather?: string;
      tags?: string[];
    };

    // バリデーション（スポットは任意: 未指定はタイムライン/マイページのみに載る「場所なし投稿」）
    if (spotSlug !== undefined && (typeof spotSlug !== "string" || spotSlug.length > 100)) {
      return NextResponse.json({ error: "スポット情報が不正です" }, { status: 400 });
    }
    const slug = typeof spotSlug === "string" ? spotSlug.trim() : "";
    // 釣り禁止スポットへの釣果報告は受け付けない。
    // UIでもフォームを出していないが、APIを直接叩かれた場合の防御。
    if (slug && getSpotBySlug(slug)?.fishingBan?.scope === "full") {
      return NextResponse.json(
        { error: "この釣り場は現在釣りが禁止されているため、釣果報告を受け付けていません。" },
        { status: 403 },
      );
    }
    if (!fishName || typeof fishName !== "string" || fishName.length > 30) {
      return NextResponse.json({ error: "魚名を入力してください（30文字以内）" }, { status: 400 });
    }
    if (!userName || typeof userName !== "string" || userName.length > 20) {
      return NextResponse.json({ error: "ニックネームを入力してください（20文字以内）" }, { status: 400 });
    }
    // ひとことは任意（唯一の作文強制だったため撤廃。チップ完結の最小投稿を許す）
    if (comment !== undefined && (typeof comment !== "string" || comment.length > 100)) {
      return NextResponse.json({ error: "コメントは100文字以内で入力してください" }, { status: 400 });
    }
    const commentText = typeof comment === "string" ? comment.trim() : "";
    if (!date || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: "日付の形式が不正です" }, { status: 400 });
    }

    // 未来の日付チェック（コンテナのTZはUTCのため、JSTの「今日」と文字列比較する。
    // UTC基準だとJST 0時〜9時に当日の投稿が「未来の日付」として弾かれてしまう）
    const todayJst = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Tokyo" }).format(new Date());
    if (date > todayJst) {
      return NextResponse.json({ error: "未来の日付は指定できません" }, { status: 400 });
    }

    // オプショナルフィールドのバリデーション
    if (photoUrl !== undefined && (typeof photoUrl !== "string" || !/^https?:\/\//.test(photoUrl))) {
      return NextResponse.json({ error: "写真URLが不正です" }, { status: 400 });
    }
    if (sizeCm !== undefined && (typeof sizeCm !== "number" || sizeCm < 0 || sizeCm > 300)) {
      return NextResponse.json({ error: "サイズは0〜300cmの範囲で入力してください" }, { status: 400 });
    }
    const ALLOWED_METHODS = ["サビキ", "投げ", "ルアー", "フカセ", "エギング", "ジギング", "穴釣り", "ウキ釣り", "その他"];
    if (method !== undefined && (typeof method !== "string" || !ALLOWED_METHODS.includes(method))) {
      return NextResponse.json({ error: "釣法が不正です" }, { status: 400 });
    }
    const ALLOWED_WEATHER = ["晴れ", "曇り", "雨", "風強い"];
    if (weather !== undefined && (typeof weather !== "string" || !ALLOWED_WEATHER.includes(weather))) {
      return NextResponse.json({ error: "天候が不正です" }, { status: 400 });
    }

    // タグ（正規化・最大5個・各20字。不正入力は黙って除外）
    const normTags = sanitizeTags(tags);

    // NGワードチェック
    const modResult = checkNgWords([userName, fishName, commentText, ...normTags]);
    if (!modResult.ok) {
      return NextResponse.json({ error: modResult.reason }, { status: 400 });
    }

    const reportId = `ugc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const reportData: CatchReport = {
      id: reportId,
      spotSlug: slug,
      spotName: slug ? spotName || "" : "",
      fishName,
      userName,
      tsuriId,
      comment: commentText,
      date,
      approved: true,
      photoUrl: photoUrl || undefined,
      sizeCm: sizeCm || undefined,
      method: method || undefined,
      weather: weather || undefined,
      submittedAt: new Date().toISOString(),
      tags: normTags.length > 0 ? normTags : undefined,
    };

    // 投稿の正本（POST#{id}/META）。パーマリンク・いいね・コメントの参照元
    try {
      await savePostMeta(reportData);
    } catch (err) {
      console.error("[釣果投稿] POST META保存エラー:", err);
      // 失敗してもスポット別ビューには載るため続行（パーマリンクのみ404になる縮退）
    }

    // 全体タイムライン（/timeline）への参照書き込み
    try {
      await addToGlobalFeed(reportData);
    } catch (err) {
      console.error("[釣果投稿] タイムライン書込エラー:", err);
    }

    // タグindex + 人気タグ（Redis zset）
    if (normTags.length > 0) {
      try {
        await addTagsForPost(reportData, normTags);
        await Promise.all(normTags.map((t) => redis.zincrby("tags:popular", 1, t)));
      } catch (err) {
        console.error("[釣果投稿] タグindex書込エラー:", err);
      }
    }

    // スポット別ビュー（場所なし投稿ではスキップ。パーマリンクとタイムラインにのみ載る）
    let isPioneer = false;
    if (slug) {
      // DynamoDB に即時保存（自動承認）- read-modify-write
      try {
        const existing = await dbGet<CatchReport[]>(`SPOT#${slug}`, "UGC_REPORTS") ?? [];

        // 開拓者判定: そのスポットの既存投稿ゼロ + 過去に開拓者がいない（レポートの
        // 365日TTL切れ後の再認定は許容するが、二重認定はPIONEERレコードの存在で防ぐ）。
        // 遡及なし: 既存投稿があるスポットは対象外。
        if (existing.length === 0) {
          try {
            const prior = await dbGet<SpotPioneer>(`SPOT#${slug}`, "PIONEER");
            if (!prior) {
              isPioneer = true;
              reportData.pioneer = true;
              // TTLなしで永続保存（釣果本体が消えても開拓者表示は残す）
              await dbPut(`SPOT#${slug}`, "PIONEER", {
                userName: reportData.userName,
                tsuriId,
                date: reportData.date,
                reportId,
                at: reportData.submittedAt ?? "",
              } satisfies SpotPioneer);
            }
          } catch (err) {
            // 開拓者の記録に失敗しても投稿は成立させる
            isPioneer = false;
            reportData.pioneer = undefined;
            console.error("[釣果投稿] 開拓者レコード保存エラー:", err);
          }
        }

        const updated = [reportData, ...existing].slice(0, 200); // 最大200件保持
        await dbPut(`SPOT#${slug}`, "UGC_REPORTS", updated, TTL_SECONDS);
        // オリジンISR＋Cloudflareエッジ(s-maxage=24h)の両方を該当スポットだけ無効化し、新しい釣果を即反映。
        // CF purge は特定URLのみ（全体purge禁止）・CF env未設定時は no-op。
        revalidatePath(`/spots/${slug}`);
        await purgeCloudflareUrls([`/spots/${slug}`]);
      } catch (err) {
        console.error("[釣果投稿] DynamoDB保存エラー:", err);
        // DynamoDB障害時もGASに送信するため続行
      }

      // 全スポット横断の最新釣果フィード（トップ「みんなの最近の釣果」用）。
      // 匿名・ログインを問わず push する（ログイン別の user_reports とは別系統）。
      // トップの導線はスポット詳細リンク前提のため、場所なし投稿は載せない。
      try {
        await redis.lpush("recent_reports:global", JSON.stringify(reportData));
        await redis.ltrim("recent_reports:global", 0, 49); // 最新50件保持
      } catch (err) {
        console.error("[釣果投稿] グローバル recent push エラー:", err);
      }
    }

    // 投稿リザルト用の差分計算 + ログインユーザーの釣果数カウント更新（バッジ・称号反映）
    const postedSpecies = splitFishNames(fishName);
    const slugByName = new Map(fishSpecies.map((f) => [f.name, f.slug]));
    let result: PostCatchResult | undefined;
    if (tsuriId) {
      // リザルト（図鑑新規・自己ベスト）は投稿「前」の状態との差分なので、書き込みより先に読む
      let prevSpecies: Set<string> | null = null;
      const prevBestBySpecies = new Map<string, number>();
      let extraSlugs = new Set<string>();
      let prevReportCount = 0;
      try {
        const [prevRaw, extra] = await Promise.all([
          redis.lrange(`auth:user_reports:${tsuriId}`, 0, 999),
          redis.smembers(`auth:fishdex_extra:${tsuriId}`),
        ]);
        const prevReports = parseReports(prevRaw as unknown[]);
        prevReportCount = prevReports.length;
        prevSpecies = new Set<string>();
        for (const r of prevReports) {
          if (!r.fishName) continue;
          for (const name of splitFishNames(r.fishName)) {
            prevSpecies.add(name);
            if (typeof r.sizeCm === "number" && Number.isFinite(r.sizeCm)) {
              prevBestBySpecies.set(name, Math.max(prevBestBySpecies.get(name) ?? 0, r.sizeCm));
            }
          }
        }
        extraSlugs = new Set(extra);
      } catch (err) {
        // 差分計算に失敗しても投稿は成立させる（リザルトは称号行のみの縮退）
        console.error("[釣果投稿] リザルト差分読込エラー:", err);
      }

      let newCount = 0;
      try {
        newCount = await incrementReportCount(tsuriId);
      } catch (err) {
        console.error("[釣果投稿] reportCount更新エラー:", err);
      }
      // Redis LIST に追加 (マイページ・統計・図鑑・ストリーク等の集計ソース)
      try {
        await redis.lpush(
          `auth:user_reports:${tsuriId}`,
          JSON.stringify(reportData),
        );
        await redis.ltrim(`auth:user_reports:${tsuriId}`, 0, 999);
      } catch (err) {
        console.error("[釣果投稿] Redis LIST push エラー:", err);
      }

      if (prevSpecies) {
        const knownSpecies = prevSpecies;
        // 図鑑の新規種: 過去投稿の魚種にも「釣ったことある」1タップ分にも無いものだけ
        const newDexSpecies = postedSpecies.filter((name) => {
          if (knownSpecies.has(name)) return false;
          const slug = slugByName.get(name);
          return !(slug && extraSlugs.has(slug));
        });
        // 図鑑種数の概算: slug に正規化できるものは slug、できないものは名前で distinct
        const dexKeys = new Set<string>();
        const keyOf = (name: string) => slugByName.get(name) ?? `name:${name}`;
        knownSpecies.forEach((name) => dexKeys.add(keyOf(name)));
        extraSlugs.forEach((slug) => dexKeys.add(slug));
        postedSpecies.forEach((name) => dexKeys.add(keyOf(name)));

        // 自己ベスト: サイズ入力があるときだけ。複数魚種投稿は先頭の魚に紐づける
        let best: PostCatchResult["best"] = null;
        if (typeof reportData.sizeCm === "number" && postedSpecies.length > 0) {
          const target = postedSpecies[0];
          const prevBest = prevBestBySpecies.get(target);
          if (prevBest === undefined || reportData.sizeCm > prevBest) {
            best = { fishName: target, sizeCm: reportData.sizeCm, prevBest: prevBest ?? null };
          }
        }

        result = {
          // incrementReportCount が使えない環境（ユーザー不在等）は user_reports 由来で近似
          reportCount: newCount > 0 ? newCount : prevReportCount + 1,
          dexCount: dexKeys.size,
          newDexSpecies,
          best,
        };
      }
    }

    // Google Apps Script Webhook に送信（記録・通知用、fire-and-forget）
    if (GAS_WEBHOOK_URL) {
      fetch(GAS_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...reportData,
          spotUrl: slug ? `https://tsurispot.com/spots/${slug}` : "",
        }),
        redirect: "follow",
      }).catch((err) => {
        console.error("[釣果投稿] GAS送信エラー:", err);
      });
    }

    return NextResponse.json({
      ok: true,
      message: "釣果が投稿されました！",
      id: reportId,
      // スポット初投稿（開拓者）。匿名にも返し、リザルトの開拓者行に使う
      pioneer: isPioneer,
      // 匿名クライアントが端末図鑑（localStorage）へ保存するための slug（正規化できた魚種のみ）
      fishSlugs: postedSpecies
        .map((name) => slugByName.get(name))
        .filter((s): s is string => Boolean(s)),
      ...(result ? { result } : {}),
    });
  } catch (e) {
    console.error("[釣果投稿] 処理エラー:", e);
    return NextResponse.json(
      { error: "投稿の処理中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
