"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { cn } from "@/lib/utils";
import { CloseIcon, StarIcon } from "@/components/icons";
import { useCart } from "@/components/cart-provider";
import { getSellerById } from "@/data/sellers";
import { trackEvent } from "@/lib/analytics";
import { getEstimatedDelivery, RETURN_POLICY, priceDeltaVsCheapest } from "@/lib/compare";

interface CompareTableProps {
  products: Product[];
  onRemove: (productId: string) => void;
}

function hasRealImage(src: string): boolean {
  return src.startsWith("/images/");
}

function Fallback() {
  return <span className="text-warm-gray/60">No data</span>;
}

function WinnerBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block text-[9px] font-medium uppercase tracking-wider bg-white border border-black/15 px-1.5 py-0.5 mb-1">
      {children}
    </span>
  );
}

export function CompareTable({ products, onRemove }: CompareTableProps) {
  const { addItem } = useCart();
  const [activeId, setActiveId] = useState(products[0]?.id);
  const [sizes, setSizes] = useState<Record<string, number | undefined>>({});

  const deliveryWindow = getEstimatedDelivery();
  const lowestPrice = Math.min(...products.map((p) => p.price));
  const highestRating = Math.max(...products.map((p) => p.rating));

  function handleAddToCart(product: Product) {
    const size = sizes[product.id];
    if (!size) return;
    addItem(product, product.colors[0], size);
    trackEvent("comparison_to_cart", { productId: product.id });
  }

  return (
    <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0 pb-2">
      <table className="border-collapse" style={{ minWidth: products.length > 2 ? `${140 + products.length * 190}px` : "100%" }}>
        <colgroup>
          <col className="w-[110px] md:w-[150px]" />
          {products.map((p) => (
            <col key={p.id} className="w-[180px]" />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-cream" />
            {products.map((product) => {
              const image = product.colors[0]?.image;
              const showImage = image && hasRealImage(image);
              return (
                <th key={product.id} className="align-bottom px-2 pb-4 text-left font-normal">
                  <div className="relative">
                    <button
                      onClick={() => onRemove(product.id)}
                      aria-label={`Remove ${product.name} from comparison`}
                      className="absolute -top-1 -right-1 z-10 w-6 h-6 rounded-full bg-white border border-black/10 flex items-center justify-center hover:border-charcoal transition-colors"
                    >
                      <CloseIcon className="h-3 w-3" />
                    </button>
                    <Link href={`/products/${product.slug}`} className="block">
                      <div
                        className="relative aspect-square overflow-hidden rounded-lg mb-2"
                        style={{
                          background: `radial-gradient(ellipse at 50% 60%, ${product.colors[0]?.hex}33 0%, ${product.colors[0]?.hex}11 40%, #ece9e2 70%)`,
                        }}
                      >
                        {showImage && (
                          <Image
                            src={image}
                            alt={product.name}
                            width={300}
                            height={300}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <h3 className="text-[12px] font-medium uppercase tracking-[0.5px] leading-snug">
                        {product.name}
                      </h3>
                    </Link>
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          <CompareRow label="Price">
            {products.map((product) => {
              const delta = priceDeltaVsCheapest(product.price, lowestPrice);
              return (
                <td key={product.id} className="px-2 py-3 align-top">
                  {product.price === lowestPrice && products.length > 1 && (
                    <WinnerBadge>Lowest Price</WinnerBadge>
                  )}
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-price">{product.price} zl</span>
                    {delta && <span className="text-[11px] text-warm-gray">{delta} vs lowest</span>}
                  </div>
                </td>
              );
            })}
          </CompareRow>

          <CompareRow label="Rating">
            {products.map((product) => (
              <td key={product.id} className="px-2 py-3 align-top">
                {product.rating === highestRating && products.length > 1 && (
                  <WinnerBadge>Top Rated</WinnerBadge>
                )}
                <div className="flex items-center gap-1">
                  <StarIcon filled className="h-3.5 w-3.5 text-charcoal" />
                  <span className="text-sm">{product.rating}</span>
                  <span className="text-[11px] text-warm-gray">({product.reviewCount})</span>
                </div>
              </td>
            ))}
          </CompareRow>

          <CompareRow label="Seller">
            {products.map((product) => {
              const seller = getSellerById(product.sellerId);
              return (
                <td key={product.id} className="px-2 py-3 align-top text-sm">
                  {seller ? seller.name : <Fallback />}
                </td>
              );
            })}
          </CompareRow>

          <CompareRow label="Features">
            {products.map((product) => (
              <td key={product.id} className="px-2 py-3 align-top text-sm text-warm-gray leading-relaxed">
                {product.features.length > 0 ? (
                  <ul className="list-disc pl-4 space-y-0.5">
                    {product.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                ) : (
                  <Fallback />
                )}
              </td>
            ))}
          </CompareRow>

          <CompareRow label="Material">
            {products.map((product) => (
              <td key={product.id} className="px-2 py-3 align-top text-sm text-warm-gray leading-relaxed">
                {product.materials?.trim() ? product.materials : <Fallback />}
              </td>
            ))}
          </CompareRow>

          <CompareRow label="Available Sizes">
            {products.map((product) => (
              <td key={product.id} className="px-2 py-3 align-top text-sm">
                {product.sizes.length > 0 ? product.sizes.join(", ") : <Fallback />}
              </td>
            ))}
          </CompareRow>

          <CompareRow label="Colors">
            {products.map((product) => (
              <td key={product.id} className="px-2 py-3 align-top">
                {product.colors.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {product.colors.map((color) => (
                      <span
                        key={color.hex}
                        title={color.name}
                        className="w-4 h-4 rounded-full border border-black/10"
                        style={{ backgroundColor: color.hex }}
                      />
                    ))}
                  </div>
                ) : (
                  <Fallback />
                )}
              </td>
            ))}
          </CompareRow>

          <CompareRow label="Delivery">
            {products.map((product) => (
              <td key={product.id} className="px-2 py-3 align-top text-sm text-warm-gray">
                {product.price >= 299 ? "Free" : "Standard"} · {deliveryWindow}
              </td>
            ))}
          </CompareRow>

          <CompareRow label="Returns" last>
            {products.map((product) => (
              <td key={product.id} className="px-2 py-3 align-top text-sm text-warm-gray">
                {RETURN_POLICY}
              </td>
            ))}
          </CompareRow>

          <tr>
            <th className="sticky left-0 z-10 bg-cream text-label text-left align-top py-3 pr-3">Size</th>
            {products.map((product) => (
              <td key={product.id} className="px-2 py-3 align-top">
                <select
                  value={sizes[product.id] ?? ""}
                  onChange={(e) =>
                    setSizes((prev) => ({ ...prev, [product.id]: Number(e.target.value) || undefined }))
                  }
                  className="w-full border border-border rounded-sm text-[12px] px-2 py-2 bg-white"
                >
                  <option value="">Select size</option>
                  {product.sizes.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </td>
            ))}
          </tr>

          <tr>
            <th className="sticky left-0 z-10 bg-cream" />
            {products.map((product) => {
              const isActive = product.id === activeId;
              return (
                <td key={product.id} className="px-2 pt-4 pb-1 align-top">
                  {isActive ? (
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!sizes[product.id]}
                      className="w-full py-3 bg-charcoal text-white text-[11px] font-medium uppercase tracking-[0.5px] rounded-full hover:bg-charcoal-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {sizes[product.id] ? `Add to Cart — ${product.price} zl` : "Select a size"}
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveId(product.id)}
                      className="w-full py-2.5 border border-border rounded-sm text-[11px] font-medium uppercase tracking-[0.5px] text-charcoal hover:border-charcoal transition-colors"
                    >
                      Choose to buy
                    </button>
                  )}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function CompareRow({
  label,
  children,
  last,
}: {
  label: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <tr className={cn("border-t border-border", last && "border-b")}>
      <th className="sticky left-0 z-10 bg-cream text-label text-left align-top py-3 pr-3">{label}</th>
      {children}
    </tr>
  );
}
