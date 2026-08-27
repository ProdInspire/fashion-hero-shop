"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCompare } from "@/components/compare-provider";
import { CompareTable } from "@/components/compare-table";
import { ProductCard } from "@/components/product-card";
import { products } from "@/data/products";
import { getCategoryLabel, MAX_COMPARE_ITEMS } from "@/lib/compare";
import { trackEvent } from "@/lib/analytics";

export default function ComparePage() {
  const { compareProducts, categoryType, removeFromCompare, clearCompare } = useCompare();

  useEffect(() => {
    if (compareProducts.length >= 2) {
      trackEvent("comparison_view", { category: categoryType, count: compareProducts.length });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compareProducts.length >= 2]);

  const suggestions = categoryType
    ? products.filter((p) => p.type === categoryType && !compareProducts.some((c) => c.id === p.id)).slice(0, 4)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-10 md:py-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[11px] text-warm-gray mb-6">
        <Link href="/" className="hover:text-charcoal transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="uppercase tracking-[0.5px] text-charcoal">Compare</span>
      </div>

      <div className="flex items-start justify-between gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-light text-charcoal mb-2">Compare Products</h1>
          <p className="text-sm text-warm-gray">
            {compareProducts.length === 0
              ? "Add 2–4 products from the same category to see them side by side."
              : categoryType
              ? `Comparing ${compareProducts.length} ${getCategoryLabel(categoryType).toLowerCase()} (max ${MAX_COMPARE_ITEMS})`
              : ""}
          </p>
        </div>
        {compareProducts.length > 0 && (
          <button
            onClick={clearCompare}
            className="text-[11px] font-medium uppercase tracking-[0.5px] text-warm-gray hover:text-charcoal transition-colors whitespace-nowrap"
          >
            Clear All
          </button>
        )}
      </div>

      {compareProducts.length === 0 && (
        <div className="text-center py-16">
          <p className="text-warm-gray mb-6">
            Tap the compare icon on any product card, or &ldquo;Add to Compare&rdquo; on a product page.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/collections/mens" className="btn-cta">
              SHOP MEN
            </Link>
            <Link href="/collections/womens" className="btn-cta-outline">
              SHOP WOMEN
            </Link>
          </div>
        </div>
      )}

      {compareProducts.length === 1 && (
        <div className="mt-8">
          <div className="max-w-[220px]">
            <ProductCard product={compareProducts[0]} />
          </div>
          <p className="text-sm text-warm-gray mt-8 mb-4">
            Add at least one more {categoryType && getCategoryLabel(categoryType).toLowerCase().replace(/s$/, "")} to
            start comparing.
          </p>
          {suggestions.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-8">
              {suggestions.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      )}

      {compareProducts.length >= 2 && (
        <div className="mt-8">
          <CompareTable products={compareProducts} onRemove={removeFromCompare} />
        </div>
      )}
    </div>
  );
}
