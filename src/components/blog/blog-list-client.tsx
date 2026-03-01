"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronRight,
  Tag,
  FileText,
  BookOpen,
  Package,
  Calendar,
  Target,
  MapPin,
  Shield,
  Lightbulb,
  Camera,
} from "lucide-react";
import { BLOG_CATEGORIES, type BlogPost } from "@/lib/data/blog";

const CATEGORY_THEME: Record<
  BlogPost["category"],
  { gradient: string; Icon: typeof BookOpen }
> = {
  beginner: { gradient: "from-blue-400 to-blue-600", Icon: BookOpen },
  gear: { gradient: "from-orange-400 to-orange-600", Icon: Package },
  seasonal: { gradient: "from-green-400 to-green-600", Icon: Calendar },
  technique: { gradient: "from-purple-400 to-purple-600", Icon: Target },
  "spot-guide": { gradient: "from-sky-400 to-sky-600", Icon: MapPin },
  manner: { gradient: "from-amber-400 to-amber-600", Icon: Shield },
  knowledge: { gradient: "from-indigo-400 to-indigo-600", Icon: Lightbulb },
  report: { gradient: "from-teal-400 to-teal-600", Icon: Camera },
};

function BlogThumbnail({ post }: { post: BlogPost }) {
  const theme = CATEGORY_THEME[post.category];
  const IconComp = theme.Icon;

  if (post.image) {
    return (
      <div className="relative h-40 w-full shrink-0 overflow-hidden sm:h-auto sm:w-[120px]">
        <Image
          src={post.image}
          alt={post.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 120px"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex h-40 w-full shrink-0 items-center justify-center bg-gradient-to-br ${theme.gradient} sm:h-auto sm:w-[120px]`}
    >
      <IconComp className="size-10 text-white/80" />
    </div>
  );
}

function BlogCard({ post }: { post: BlogPost }) {
  return (
    <Link href={`/blog/${post.slug}`}>
      <Card className="group h-full overflow-hidden py-0 transition-shadow hover:shadow-md">
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
            <div className="flex items-center gap-1 text-sm font-medium text-primary">
              続きを読む
              <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}

export function BlogListClient({ posts }: { posts: BlogPost[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const allCategories = Object.entries(BLOG_CATEGORIES) as [
    BlogPost["category"],
    string,
  ][];

  const filteredPosts = activeCategory
    ? posts.filter((p) => p.category === activeCategory)
    : posts;

  return (
    <>
      {/* カテゴリフィルター */}
      <div className="mb-8 flex flex-wrap gap-2">
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
          const count = posts.filter((p) => p.category === key).length;
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

      {/* 記事一覧 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {filteredPosts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <FileText className="mx-auto mb-4 size-12 opacity-30" />
          <p>この分類の記事はまだありません。</p>
        </div>
      )}
    </>
  );
}
