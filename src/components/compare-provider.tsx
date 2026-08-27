"use client";

import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from "react";
import type { Product, ShoeType } from "@/types";
import { products } from "@/data/products";
import { MAX_COMPARE_ITEMS, getCategoryLabel } from "@/lib/compare";
import { trackEvent } from "@/lib/analytics";
import { CompareBar } from "./compare-bar";

interface CompareContextType {
  compareIds: string[];
  compareProducts: Product[];
  categoryType: ShoeType | null;
  blockedReason: string | null;
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isComparing: (productId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | null>(null);

const STORAGE_KEY = "fashionhero-compare";

function loadCompare(): string[] {
  try {
    if (typeof window === "undefined") return [];
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCompare(ids: string[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // sessionStorage unavailable
  }
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);
  const blockedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setCompareIds(loadCompare());
  }, []);

  useEffect(() => {
    return () => {
      if (blockedTimeoutRef.current) clearTimeout(blockedTimeoutRef.current);
    };
  }, []);

  const showBlockedReason = useCallback((message: string) => {
    setBlockedReason(message);
    if (blockedTimeoutRef.current) clearTimeout(blockedTimeoutRef.current);
    blockedTimeoutRef.current = setTimeout(() => setBlockedReason(null), 4000);
  }, []);

  const compareProducts = useMemo(
    () => compareIds.map((id) => products.find((p) => p.id === id)).filter((p): p is Product => Boolean(p)),
    [compareIds]
  );

  const categoryType = compareProducts[0]?.type ?? null;

  const addToCompare = useCallback(
    (product: Product) => {
      setCompareIds((prev) => {
        if (prev.includes(product.id)) {
          showBlockedReason("This product has been already added to comparison");
          return prev;
        }

        if (prev.length >= MAX_COMPARE_ITEMS) {
          showBlockedReason(
            `You can compare up to ${MAX_COMPARE_ITEMS} products at a time. Remove one to add another.`
          );
          return prev;
        }

        const currentType = prev.length > 0 ? products.find((p) => p.id === prev[0])?.type : undefined;
        if (currentType && currentType !== product.type) {
          showBlockedReason(
            `Comparison only works within one category. You're comparing ${getCategoryLabel(
              currentType
            )} — remove those first to compare ${getCategoryLabel(product.type)}.`
          );
          return prev;
        }

        trackEvent("comparison_add", { productId: product.id, category: product.type });
        const next = [...prev, product.id];
        saveCompare(next);
        return next;
      });
    },
    [showBlockedReason]
  );

  const removeFromCompare = useCallback((productId: string) => {
    trackEvent("comparison_remove", { productId });
    setCompareIds((prev) => {
      const next = prev.filter((id) => id !== productId);
      saveCompare(next);
      return next;
    });
  }, []);

  const clearCompare = useCallback(() => {
    setCompareIds([]);
    saveCompare([]);
  }, []);

  const isComparing = useCallback((productId: string) => compareIds.includes(productId), [compareIds]);

  return (
    <CompareContext.Provider
      value={{
        compareIds,
        compareProducts,
        categoryType,
        blockedReason,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isComparing,
      }}
    >
      {children}
      <CompareBar />
    </CompareContext.Provider>
  );
}
