"use client";

import { ShoppingBag } from "lucide-react";
import { ProductCard } from "./product-card";
import type { Product } from "@/lib/data/products";
import type { PageType } from "@/lib/affiliate-config";

interface ProductListProps {
  products: Product[];
  title?: string;
  description?: string;
  maxItems?: number;
  pageType?: PageType;
}

export function ProductList({
  products,
  title,
  description,
  maxItems,
  pageType,
}: ProductListProps) {
  const displayProducts = maxItems ? products.slice(0, maxItems) : products;

  if (displayProducts.length === 0) return null;

  return (
    <section>
      {title && (
        <div className="mb-4">
          <h2 className="flex items-center gap-2 text-lg font-bold sm:text-xl">
            <ShoppingBag className="size-5 text-primary" />
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayProducts.map((product) => (
          <ProductCard key={product.id} product={product} pageType={pageType} />
        ))}
      </div>
    </section>
  );
}
