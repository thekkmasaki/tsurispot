// dry-run.test.mjs — spot-generator の補助スクリプト smoke test。
// vitest で実行: npx vitest run scripts/spot-generator/__tests__/dry-run.test.mjs

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const ROOT = path.resolve(import.meta.dirname, "..", "..", "..");
const TMPDIR = path.join(os.tmpdir(), `spotgen-test-${Date.now()}`);

function runNode(scriptRel, args) {
  return execFileSync("node", [path.join(ROOT, scriptRel), ...args], {
    cwd: ROOT,
    encoding: "utf8",
  });
}

beforeAll(() => {
  fs.mkdirSync(TMPDIR, { recursive: true });
});

afterAll(() => {
  fs.rmSync(TMPDIR, { recursive: true, force: true });
});

describe("dump-existing-spots.mjs", () => {
  it("既存スポットを JSON でダンプできる", () => {
    const out = path.join(TMPDIR, "existing.json");
    const stdout = runNode("scripts/spot-generator/dump-existing-spots.mjs", [`--out=${out}`]);
    const result = JSON.parse(stdout);
    expect(result.ok).toBe(true);
    expect(result.total).toBeGreaterThan(1000); // 既存7,000以上ある想定
    expect(fs.existsSync(out)).toBe(true);
    const data = JSON.parse(fs.readFileSync(out, "utf8"));
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty("slug");
    expect(data[0]).toHaveProperty("lat");
    expect(data[0]).toHaveProperty("lng");
  });
});

describe("capacity-check.mjs", () => {
  it("総スポット数と TS バイト数を返す", () => {
    let stdout;
    try {
      stdout = runNode("scripts/spot-generator/capacity-check.mjs", []);
    } catch (e) {
      // warn / hard でも stdout は出ているので status だけ無視して使う
      stdout = e.stdout?.toString() ?? "";
    }
    const result = JSON.parse(stdout);
    expect(result).toHaveProperty("total_spots");
    expect(result).toHaveProperty("ts_bytes");
    expect(result).toHaveProperty("level");
    expect(["ok", "warn", "hard"]).toContain(result.level);
    expect(result.thresholds.HARD_COUNT).toBe(8500);
    expect(result.thresholds.HARD_BYTES).toBe(18 * 1024 * 1024);
  });
});

describe("checkpoint.mjs", () => {
  it("init → read → update → clear のサイクルが動く", () => {
    // checkpoint は state ディレクトリに直接書くので一旦バックアップ→終了時にクリア
    const stateFile = path.join(ROOT, ".claude", "state", "spot-generation-progress.json");
    let backup = null;
    if (fs.existsSync(stateFile)) backup = fs.readFileSync(stateFile, "utf8");
    try {
      const initOut = runNode("scripts/spot-generator/checkpoint.mjs", [
        "init",
        "--run-id=test-run-001",
        "--region=test",
        "--mode=csv",
        "--target=10",
      ]);
      const initResult = JSON.parse(initOut);
      expect(initResult.ok).toBe(true);

      const readOut = runNode("scripts/spot-generator/checkpoint.mjs", ["read"]);
      const data = JSON.parse(readOut);
      expect(data.run_id).toBe("test-run-001");
      expect(data.region).toBe("test");
      expect(data.completed_batches).toEqual([]);

      const updateOut = runNode("scripts/spot-generator/checkpoint.mjs", [
        "update",
        `--json=${JSON.stringify({
          completed_batches: [{ n: 1, file: "x.ts", added_slugs: ["a", "b"], skipped: 0 }],
        })}`,
      ]);
      expect(JSON.parse(updateOut).ok).toBe(true);

      const after = JSON.parse(runNode("scripts/spot-generator/checkpoint.mjs", ["read"]));
      expect(after.completed_batches.length).toBe(1);
      expect(after.completed_batches[0].added_slugs).toEqual(["a", "b"]);

      runNode("scripts/spot-generator/checkpoint.mjs", ["clear"]);
      expect(fs.existsSync(stateFile)).toBe(false);
    } finally {
      if (backup !== null) {
        fs.mkdirSync(path.dirname(stateFile), { recursive: true });
        fs.writeFileSync(stateFile, backup);
      }
    }
  });
});

describe("parse-csv.mjs", () => {
  it("CSV から正規化 JSON に変換できる", () => {
    const csvFile = path.join(TMPDIR, "input.csv");
    fs.writeFileSync(
      csvFile,
      [
        "name,lat,lng,prefecture,city,spotType,fishCandidates,description",
        `"テスト港",36.21,136.15,福井県,坂井市,port,aji|kisu,"福井県坂井市にあるテスト用の架空の港。広い岸壁が特徴で、サビキ釣りやちょい投げで多魚種を狙える。アクセスも良好でファミリーフィッシングに向く。"`,
      ].join("\n"),
      "utf8",
    );
    const out = path.join(TMPDIR, "candidates.json");
    const stdout = runNode("scripts/spot-generator/parse-csv.mjs", [
      `--in=${csvFile}`,
      `--out=${out}`,
    ]);
    const result = JSON.parse(stdout);
    expect(result.ok).toBe(true);
    expect(result.count).toBe(1);
    const data = JSON.parse(fs.readFileSync(out, "utf8"));
    expect(data[0].name).toBe("テスト港");
    expect(data[0].lat).toBe(36.21);
    expect(data[0].fishCandidates).toEqual(["aji", "kisu"]);
  });
});

describe("format-spot.mjs", () => {
  it("候補3件から TS ファイルを生成できる", () => {
    const candFile = path.join(TMPDIR, "candidates.json");
    const existingFile = path.join(TMPDIR, "existing.json");
    const outTs = path.join(TMPDIR, "spots-gen-test.ts");

    fs.writeFileSync(
      candFile,
      JSON.stringify([
        {
          name: "テスト港A",
          lat: 36.21,
          lng: 136.15,
          prefecture: "福井県",
          city: "坂井市",
          spotType: "port",
          description:
            "福井県坂井市にあるテスト用の漁港。広く整備された岸壁が特徴で、四季を通じて多魚種が狙える。サビキ釣りでアジ・サバ・イワシ、ちょい投げではキスやハゼが期待でき、ファミリーフィッシングから本格派まで幅広く楽しめるアクセス良好な人気スポット。",
        },
        {
          name: "テスト浜B",
          lat: 36.22,
          lng: 136.16,
          prefecture: "福井県",
          city: "坂井市",
          spotType: "beach",
          description:
            "福井県坂井市の長大なサーフで、秋から春にかけてのヒラメ・マゴチが実績豊富。投げ釣りでのキスは夏場に絶好調で、初夏から秋にかけてはルアーアングラーが青物を狙って訪れる賑わいのある人気エリア。",
        },
        {
          name: "テスト磯C",
          lat: 36.23,
          lng: 136.17,
          prefecture: "福井県",
          city: "坂井市",
          spotType: "rocky",
          description:
            "福井県坂井市の地磯で、グレ・メジナのフカセ釣りで知られる。冬から春にかけて型ものの実績があり、フカセ・カゴ釣り愛好家から定評がある。アクセスはやや厳しめだが、その分人が少なくゆったり釣りができる穴場的スポット。",
        },
      ]),
    );
    fs.writeFileSync(existingFile, JSON.stringify([]));

    const stdout = runNode("scripts/spot-generator/format-spot.mjs", [
      `--candidates=${candFile}`,
      `--existing=${existingFile}`,
      "--run-id=20260527-1030-fukui",
      "--batch-n=1",
      `--out=${outTs}`,
    ]);
    const result = JSON.parse(stdout);
    expect(result.ok).toBe(true);
    expect(result.added_slugs.length).toBe(3);
    expect(fs.existsSync(outTs)).toBe(true);
    const tsContent = fs.readFileSync(outTs, "utf8");
    expect(tsContent).toMatch(/^import \{ FishingSpot, FishSpecies, Region \}/m);
    expect(tsContent).toMatch(/export const spotsGen/);
    expect(tsContent).toMatch(/spotType: "port"/);
    expect(tsContent).toMatch(/spotType: "beach"/);
    expect(tsContent).toMatch(/spotType: "rocky"/);
  });

  it("description が短すぎる候補はスキップする", () => {
    const candFile = path.join(TMPDIR, "candidates-bad.json");
    const existingFile = path.join(TMPDIR, "existing.json");
    const outTs = path.join(TMPDIR, "spots-gen-bad.ts");

    fs.writeFileSync(
      candFile,
      JSON.stringify([
        {
          name: "短文港",
          lat: 36.21,
          lng: 136.15,
          prefecture: "福井県",
          spotType: "port",
          description: "短い文",
        },
      ]),
    );
    fs.writeFileSync(existingFile, JSON.stringify([]));

    const stdout = runNode("scripts/spot-generator/format-spot.mjs", [
      `--candidates=${candFile}`,
      `--existing=${existingFile}`,
      "--run-id=20260527-1030-test",
      "--batch-n=2",
      `--out=${outTs}`,
    ]);
    const result = JSON.parse(stdout);
    expect(result.ok).toBe(false);
    expect(result.errors.length).toBe(1);
    expect(result.errors[0].reason).toMatch(/description/);
  });
});
