"use client";

import { useState, useMemo, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronRight,
  Tag,
  FileText,
  Search,
  X,
  GraduationCap,
  Wrench,
  Calendar,
  Target,
  MapPin,
  Scale,
  Lightbulb,
  Fish,
} from "lucide-react";
import { BLOG_CATEGORIES, type BlogPost } from "@/lib/data/blog";

/** リスト表示用の軽量型（content除外） */
type BlogPostSummary = Omit<BlogPost, "content">;

/** カテゴリ別のデフォルトサムネイル画像パス */
const CATEGORY_DEFAULT_IMAGE: Record<BlogPost["category"], string> = {
  beginner: "/images/blog/defaults/beginner.svg",
  gear: "/images/blog/defaults/gear.svg",
  seasonal: "/images/blog/defaults/seasonal.svg",
  technique: "/images/blog/defaults/technique.svg",
  "spot-guide": "/images/blog/defaults/spot-guide.svg",
  manner: "/images/blog/defaults/manner.svg",
  knowledge: "/images/blog/defaults/knowledge.svg",
  report: "/images/blog/defaults/report.svg",
};

/** カテゴリ別グラデーション＋アイコン（画像なし時のフォールバック） */
const CATEGORY_STYLE: Record<BlogPost["category"], { gradient: string; Icon: typeof Fish }> = {
  beginner: { gradient: "from-emerald-400 to-teal-500", Icon: GraduationCap },
  gear: { gradient: "from-slate-500 to-zinc-600", Icon: Wrench },
  seasonal: { gradient: "from-amber-400 to-orange-500", Icon: Calendar },
  technique: { gradient: "from-sky-400 to-blue-600", Icon: Target },
  "spot-guide": { gradient: "from-cyan-400 to-teal-500", Icon: MapPin },
  manner: { gradient: "from-violet-400 to-purple-600", Icon: Scale },
  knowledge: { gradient: "from-blue-400 to-indigo-600", Icon: Lightbulb },
  report: { gradient: "from-sky-400 to-cyan-500", Icon: Fish },
};

/** タグの魚名 → 画像slug マッピング */
const FISH_TAG_TO_SLUG: Record<string, string> = {
  "アジ": "aji", "サバ": "saba", "カサゴ": "kasago", "ガシラ": "kasago",
  "メバル": "mebaru", "イワシ": "iwashi", "シーバス": "seabass",
  "タチウオ": "tachiuo", "マダイ": "madai", "キス": "kisu",
  "カレイ": "karei", "イシガレイ": "karei", "マコガレイ": "karei",
  "アオリイカ": "aoriika", "カワハギ": "kawahagi", "サヨリ": "sayori",
  "ヒラメ": "hirame", "イナダ": "inada", "カマス": "kamasu",
  "マダコ": "madako", "ヤリイカ": "yariika", "スルメイカ": "surumeika",
  "コウイカ": "kouika", "ワタリガニ": "watarigani", "アイナメ": "ainame",
  "クロソイ": "kurosoi", "ブリ": "buri", "アナゴ": "anago",
  "マゴチ": "magochi", "メジナ": "mejina", "グレ": "mejina",
  "クロダイ": "kurodai", "チヌ": "kurodai", "ホッケ": "hokke",
  "シャコ": "saba", "フグ": "fugu", "ハゼ": "haze",
  "イサキ": "isaki", "カンパチ": "kanpachi", "ヒラマサ": "hiramasa",
  "イシダイ": "ishidai", "コブダイ": "kobudai", "アマダイ": "amadai",
  "ハタ": "hata", "アカハタ": "akahata", "シマアジ": "shimaaji",
  "サクラマス": "sakuramasu", "ヤマメ": "yamame", "イワナ": "iwana",
  "ニジマス": "nijimasu", "アユ": "ayu", "ブラックバス": "blackbass",
  "ワカサギ": "wakasagi", "コイ": "koi", "テナガエビ": "tenagaebi",
  "シイラ": "shiira", "カツオ": "katsuo", "ウナギ": "unagi",
};

const FALLBACK_FISH = ["aji", "madai", "mebaru", "kasago", "seabass", "buri"];

function getFallbackImage(tags: string[], postId: string): string {
  // タグから魚名を探して対応する写真を返す
  for (const tag of tags) {
    const slug = FISH_TAG_TO_SLUG[tag];
    if (slug) return `/images/fish/${slug}.jpg`;
  }
  // マッチしなければローテーション
  let hash = 0;
  for (let i = 0; i < postId.length; i++) hash = (hash * 31 + postId.charCodeAt(i)) | 0;
  return `/images/fish/${FALLBACK_FISH[Math.abs(hash) % FALLBACK_FISH.length]}.jpg`;
}

function BlogThumbnail({ post }: { post: BlogPostSummary }) {
  const imgSrc = post.image || getFallbackImage(post.tags, post.id);

  return (
    <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden sm:aspect-auto sm:h-full sm:w-[140px]">
      <Image
        src={imgSrc}
        alt={post.title}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, 140px"
      />
    </div>
  );
}

function BlogCard({ post }: { post: BlogPostSummary }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="group h-full overflow-hidden py-0 transition-all duration-200 hover:shadow-lg hover:shadow-ocean-deep/8 hover:-translate-y-0.5">
        <div className="flex h-full flex-col sm:flex-row">
          <BlogThumbnail post={post} />
          <CardContent className="flex flex-1 flex-col gap-3 p-5">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {BLOG_CATEGORIES[post.category]}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {post.publishedAt}
              </span>
            </div>
            <h2 className="text-base font-semibold leading-snug group-hover:text-primary sm:text-lg">
              {post.title}
            </h2>
            <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
              {post.description}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {post.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-0.5 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                >
                  <Tag className="size-2.5" />
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-1 text-sm font-medium text-ocean-mid">
              続きを読む
              <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}

/** 初期表示タグ数 */
const INITIAL_TAG_COUNT = 15;

const EMPTY_SET = () => new Set<string>();
const INITIAL_DISPLAY = 20;

/** エリアフィルターに表示する主要エリア名（週報エリア中心に厳選） */
const AREA_WHITELIST = new Set([
  "北海道", "東北", "関東", "中部", "近畿", "中国", "四国", "九州", "沖縄",
  "小樽・石狩", "仙台・石巻", "東京湾", "駿河湾・伊豆",
  "知多・三河", "大阪湾・泉南", "明石・神戸", "南紀・白浜",
  "瀬戸内・広島", "福岡・北九州",
]);

export function BlogListClient({ posts }: { posts: BlogPostSummary[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTags, setActiveTags] = useState<Set<string>>(EMPTY_SET);
  const [activeArea, setActiveArea] = useState<string | null>(null);
  const [showAllTags, setShowAllTags] = useState(false);
  const [displayCount, setDisplayCount] = useState(INITIAL_DISPLAY);

  const allCategories = Object.entries(BLOG_CATEGORIES) as [
    BlogPost["category"],
    string,
  ][];

  // カテゴリ別件数をメモ化（レンダー毎の .filter() 排除）
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const post of posts) {
      counts.set(post.category, (counts.get(post.category) ?? 0) + 1);
    }
    return counts;
  }, [posts]);

  // エリアタグ抽出（ホワイトリストに一致するタグのみ）
  const areaTags = useMemo(() => {
    const areaCounts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags) {
        if (AREA_WHITELIST.has(tag)) {
          areaCounts.set(tag, (areaCounts.get(tag) ?? 0) + 1);
        }
      }
    }
    return [...areaCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([area, count]) => ({ area, count }));
  }, [posts]);

  // タグ一覧を出現回数順にソート
  const sortedTags = useMemo(() => {
    const tagCounts = new Map<string, number>();
    for (const post of posts) {
      for (const tag of post.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }
    return [...tagCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([tag, count]) => ({ tag, count }));
  }, [posts]);

  const visibleTags = showAllTags
    ? sortedTags
    : sortedTags.slice(0, INITIAL_TAG_COUNT);

  // フィルタリング: テキスト AND カテゴリ AND タグ（OR）
  const filteredPosts = useMemo(() => {
    let result = posts;

    // テキスト検索（タイトル・説明・タグ・関連スポット）
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q)) ||
          (p.relatedSpots && p.relatedSpots.some((s) => s.toLowerCase().replace(/-/g, " ").includes(q))),
      );
    }

    // カテゴリフィルター
    if (activeCategory) {
      result = result.filter((p) => p.category === activeCategory);
    }

    // エリアフィルター
    if (activeArea) {
      result = result.filter((p) => p.tags.includes(activeArea));
    }

    // タグフィルター（OR: いずれかのタグを含む）
    if (activeTags.size > 0) {
      result = result.filter((p) =>
        p.tags.some((t) => activeTags.has(t)),
      );
    }

    return result;
  }, [posts, searchQuery, activeCategory, activeArea, activeTags]);

  const hasActiveFilter =
    searchQuery.trim() !== "" ||
    activeCategory !== null ||
    activeArea !== null ||
    activeTags.size > 0;

  const toggleTag = useCallback((tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setActiveCategory(null);
    setActiveArea(null);
    setActiveTags(new Set());
    setDisplayCount(INITIAL_DISPLAY);
  }, []);

  return (
    <>
      {/* フィルターセクション */}
      <div className="mb-8 space-y-4">
        {/* 検索ボックス */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="記事を検索（例: 明石、仙台、サビキ、初心者）"
            className="h-12 w-full rounded-xl border border-input bg-background pl-10 pr-10 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 sm:h-10 sm:text-sm"
          />
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          ) : null}
        </div>

        {/* カテゴリフィルター */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveCategory(null)}
            className="min-h-[40px] focus:outline-none"
          >
            <Badge
              variant={activeCategory === null ? "default" : "outline"}
              className="cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              すべて
              <span className="ml-1 opacity-70">({posts.length})</span>
            </Badge>
          </button>
          {allCategories.map(([key, label]) => {
            const count = categoryCounts.get(key) ?? 0;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() =>
                  setActiveCategory(activeCategory === key ? null : key)
                }
                className="min-h-[40px] focus:outline-none"
              >
                <Badge
                  variant={activeCategory === key ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1.5 text-sm transition-colors hover:bg-primary/10"
                >
                  {label}
                  <span className="ml-1 opacity-70">({count})</span>
                </Badge>
              </button>
            );
          })}
        </div>

        {/* エリアフィルター */}
        {areaTags.length > 0 ? (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <MapPin className="size-3" />
              エリアで絞り込み
            </div>
            <div className="flex flex-wrap gap-1.5">
              {areaTags.map(({ area, count }) => (
                <button
                  key={area}
                  onClick={() => {
                    setActiveArea(activeArea === area ? null : area);
                    setDisplayCount(INITIAL_DISPLAY);
                  }}
                  className="focus:outline-none"
                >
                  <Badge
                    variant={activeArea === area ? "default" : "outline"}
                    className="cursor-pointer px-2.5 py-1 text-xs transition-colors hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300"
                  >
                    {area}
                    <span className="ml-1 opacity-60">({count})</span>
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {/* タグフィルター */}
        {sortedTags.length > 0 ? (
          <div>
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Tag className="size-3" />
              タグで絞り込み
            </div>
            <div className="flex flex-wrap gap-1.5">
              {visibleTags.map(({ tag, count }) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className="focus:outline-none"
                >
                  <Badge
                    variant={activeTags.has(tag) ? "default" : "outline"}
                    className="cursor-pointer px-2.5 py-1 text-xs transition-colors hover:bg-primary/10"
                  >
                    {tag}
                    <span className="ml-1 opacity-60">({count})</span>
                  </Badge>
                </button>
              ))}
              {sortedTags.length > INITIAL_TAG_COUNT ? (
                <button
                  onClick={() => setShowAllTags((prev) => !prev)}
                  className="px-2 py-1 text-xs font-medium text-primary hover:underline focus:outline-none"
                >
                  {showAllTags
                    ? "閉じる"
                    : `+${sortedTags.length - INITIAL_TAG_COUNT}件を表示`}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>

      {/* 件数表示 + リセット */}
      <div className="mb-4 flex items-center gap-2">
        <FileText className="size-4 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {hasActiveFilter ? (
            <>
              <span className="font-semibold text-foreground">
                {filteredPosts.length}件
              </span>
              の記事がヒット
              {filteredPosts.length !== posts.length ? (
                <span className="ml-1">（全{posts.length}件中）</span>
              ) : null}
            </>
          ) : (
            <>
              全
              <span className="font-semibold text-foreground">
                {posts.length}件
              </span>
              の記事
            </>
          )}
        </p>
        {hasActiveFilter ? (
          <button
            onClick={resetFilters}
            className="ml-auto text-xs font-medium text-primary hover:underline"
          >
            フィルターをリセット
          </button>
        ) : null}
      </div>

      {/* 記事一覧 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {filteredPosts.slice(0, displayCount).map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>

      {filteredPosts.length > displayCount ? (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setDisplayCount((prev) => prev + 20)}
            className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-6 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
          >
            もっと見る（残り{filteredPosts.length - displayCount}件）
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      ) : null}

      {filteredPosts.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <FileText className="mx-auto mb-4 size-12 opacity-30" />
          <p className="mb-2">条件に一致する記事が見つかりませんでした</p>
          <p className="text-sm">
            検索ワードやフィルター条件を変更してみてください
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 text-sm font-medium text-primary hover:underline"
          >
            フィルターをリセット
          </button>
        </div>
      ) : null}
    </>
  );
}
