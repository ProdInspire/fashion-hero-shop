"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CloseIcon } from "./icons";
import { useCompare } from "./compare-provider";
import { MIN_COMPARE_ITEMS_FOR_TABLE } from "@/lib/compare";

function hasRealImage(src: string): boolean {
  return src.startsWith("/images/");
}

export function CompareBar() {
  const { compareProducts, blockedReason, removeFromCompare, clearCompare } = useCompare();
  const pathname = usePathname();

  if (pathname === "/compare" && !blockedReason) return null;
  if (compareProducts.length === 0 && !blockedReason) return null;

  const canOpenTable = compareProducts.length >= MIN_COMPARE_ITEMS_FOR_TABLE;

  return (
    <div className="fixed bottom-4 inset-x-0 z-40 flex flex-col items-center gap-2 px-4 pointer-events-none">
      {blockedReason && (
        <div className="pointer-events-auto max-w-md bg-charcoal text-white text-[12px] leading-snug px-4 py-2.5 rounded-lg shadow-lg">
          {blockedReason}
        </div>
      )}

      {compareProducts.length > 0 && pathname !== "/compare" && (
        <div className="pointer-events-auto flex items-center gap-3 bg-white border border-black/10 rounded-full pl-2 pr-2 py-2 shadow-lg max-w-[calc(100vw-2rem)]">
          <div className="flex items-center gap-1.5 pl-1">
            {compareProducts.map((product) => {
              const image = product.colors[0]?.image;
              const showImage = image && hasRealImage(image);
              return (
                <div key={product.id} className="relative w-8 h-8 flex-shrink-0">
                  <div
                    className="w-8 h-8 rounded-md overflow-hidden bg-cream border border-black/10"
                    style={!showImage ? { backgroundColor: `${product.colors[0]?.hex}33` } : undefined}
                  >
                    {showImage && (
                      <Image src={image} alt={product.name} width={32} height={32} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCompare(product.id)}
                    aria-label={`Remove ${product.name} from comparison`}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-charcoal text-white flex items-center justify-center"
                  >
                    <CloseIcon className="h-2.5 w-2.5" />
                  </button>
                </div>
              );
            })}
          </div>

          <Link
            href={canOpenTable ? "/compare" : "#"}
            aria-disabled={!canOpenTable}
            className={cn(
              "text-[11px] font-medium uppercase tracking-[0.5px] rounded-full px-4 py-2 whitespace-nowrap transition-colors",
              canOpenTable
                ? "bg-charcoal text-white hover:opacity-85"
                : "bg-cream-dark text-warm-gray cursor-default"
            )}
          >
            {canOpenTable ? `Compare (${compareProducts.length})` : `Add ${MIN_COMPARE_ITEMS_FOR_TABLE - compareProducts.length} more`}
          </Link>

          <button
            onClick={clearCompare}
            aria-label="Clear comparison"
            className="text-warm-gray hover:text-charcoal transition-colors p-1"
          >
            <CloseIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
