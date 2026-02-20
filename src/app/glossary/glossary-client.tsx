"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GlossaryTerm {
  term: string;
  reading?: string;
  description: string;
  link?: { href: string; label: string };
}

interface GlossaryCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  terms: GlossaryTerm[];
}

interface GlossaryClientProps {
  glossaryData: GlossaryCategory[];
}

export function GlossaryClient({ glossaryData }: GlossaryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return glossaryData;

    const query = searchQuery.trim().toLowerCase();
    return glossaryData
      .map((category) => ({
        ...category,
        terms: category.terms.filter(
          (item) =>
            item.term.toLowerCase().includes(query) ||
            (item.reading && item.reading.toLowerCase().includes(query)) ||
            item.description.toLowerCase().includes(query)
        ),
      }))
      .filter((category) => category.terms.length > 0);
  }, [glossaryData, searchQuery]);

  const totalFiltered = filteredData.reduce(
    (acc, cat) => acc + cat.terms.length,
    0
  );
  const totalAll = glossaryData.reduce(
    (acc, cat) => acc + cat.terms.length,
    0
  );

  return (
    <>
      {/* Search input */}
      <div className="mb-8">
        <div className="relative mx-auto max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="用語を検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-white py-2.5 pl-10 pr-10 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="検索をクリア"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        {searchQuery && (
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {totalFiltered > 0
              ? `${totalAll}語中 ${totalFiltered}語が一致`
              : "一致する用語が見つかりませんでした"}
          </p>
        )}
      </div>

      {/* Category navigation (hide when searching) */}
      {!searchQuery && (
        <nav className="mb-8 flex flex-wrap justify-center gap-2">
          {glossaryData.map((category) => (
            <a
              key={category.id}
              href={`#${category.id}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-foreground"
            >
              {category.icon}
              {category.title}
            </a>
          ))}
        </nav>
      )}

      {/* Glossary sections */}
      <div className="space-y-10">
        {filteredData.map((category) => (
          <section key={category.id} id={category.id}>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold">
              {category.icon}
              {category.title}
              <Badge variant="secondary" className="text-xs">
                {category.terms.length}語
              </Badge>
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {category.terms.map((item) => (
                <Card key={item.term} className="gap-0 py-0">
                  <CardHeader className="pb-1 pt-4">
                    <CardTitle className="text-base">
                      {item.term}
                      {item.reading && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          ({item.reading})
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-4 pt-1">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </p>
                    {item.link && (
                      <Link
                        href={item.link.href}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                      >
                        <Search className="size-3" />
                        {item.link.label}
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Empty state for search */}
      {searchQuery && filteredData.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            「{searchQuery}」に一致する用語が見つかりませんでした。
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-3 text-sm font-medium text-primary hover:underline"
          >
            検索をクリア
          </button>
        </div>
      )}
    </>
  );
}
