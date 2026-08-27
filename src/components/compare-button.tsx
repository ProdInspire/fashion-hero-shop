"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { CompareIcon, CheckIcon } from "./icons";
import { useCompare } from "./compare-provider";
import type { Product } from "@/types";

interface CompareButtonProps {
  product: Product;
  className?: string;
  /** "checkbox" — square toggle for product cards. "utility" — labeled button for the PDP. */
  variant?: "checkbox" | "utility";
}

export function CompareButton({ product, className, variant = "checkbox" }: CompareButtonProps) {
  const { addToCompare, isComparing } = useCompare();
  const comparing = isComparing(product.id);
  const [animating, setAnimating] = useState(false);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setAnimating(true);
    addToCompare(product);
    setTimeout(() => setAnimating(false), 250);
  }

  if (variant === "utility") {
    return (
      <button
        onClick={handleClick}
        aria-pressed={comparing}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-sm border px-3 py-2 text-[11px] font-medium uppercase tracking-[0.5px] transition-colors",
          comparing
            ? "border-charcoal bg-charcoal text-white"
            : "border-border text-charcoal hover:border-charcoal",
          className
        )}
      >
        {comparing ? <CheckIcon /> : <CompareIcon className="h-3.5 w-3.5" />}
        {comparing ? "Added to Compare" : "Add to Compare"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      aria-pressed={comparing}
      aria-label={comparing ? "Already added to comparison" : "Add to comparison"}
      title={comparing ? "Already added to comparison" : "Add to comparison"}
      className={cn(
        "flex items-center justify-center w-6 h-6 rounded-sm border-2 shadow-sm transition-all duration-200 ease-out",
        comparing
          ? "border-charcoal bg-charcoal"
          : "border-black/20 bg-white hover:border-charcoal",
        animating && "scale-110",
        className
      )}
    >
      <CheckIcon className={cn("h-3.5 w-3.5", comparing ? "text-white opacity-100" : "opacity-0")} />
    </button>
  );
}
