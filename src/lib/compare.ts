import type { ShoeType } from "@/types";

export const MAX_COMPARE_ITEMS = 4;
export const MIN_COMPARE_ITEMS_FOR_TABLE = 2;

const TYPE_LABELS: Record<ShoeType, string> = {
  runner: "Runners",
  walker: "Walkers",
  "slip-on": "Slip-Ons",
  trainer: "Trainers",
  flat: "Flats",
  hiker: "Hikers",
  slide: "Slides",
  loafer: "Loafers",
  sock: "Socks",
  tee: "Tees",
  hoodie: "Hoodies",
  pant: "Pants",
  jacket: "Jackets",
  cardigan: "Cardigans",
  bag: "Bags",
  beanie: "Beanies",
  cap: "Caps",
  insole: "Insoles",
};

export function getCategoryLabel(type: ShoeType): string {
  return TYPE_LABELS[type] ?? type;
}

/** Same estimated delivery window used on the PDP — flat across the catalog today. */
export function getEstimatedDelivery(): string {
  const now = new Date();
  const startDate = new Date(now.getTime() + 5 * 86400000);
  const endDate = new Date(now.getTime() + 7 * 86400000);
  const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
  return `${fmt.format(startDate)} - ${fmt.format(endDate)}`;
}

/** No seller-specific return policy field exists yet — same copy shown on the PDP. */
export const RETURN_POLICY = "Easy Returns";

/** Matches the flat shipping policy stated on the PDP. */
export const FREE_SHIPPING_THRESHOLD = 299;

export function priceDeltaVsCheapest(price: number, cheapest: number): string | null {
  if (price <= cheapest || cheapest <= 0) return null;
  const pct = Math.round(((price - cheapest) / cheapest) * 100);
  return `+${pct}%`;
}
