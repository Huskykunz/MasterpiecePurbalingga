import { Product } from "../types";

export interface PriceInfo {
  finalPrice: number;
  originalPrice: number;
  hasDiscount: boolean;
  discountLabel: string;
  discountPercent: number;
  isExpired: boolean;
}

export function getDiscountedPrice(product: Product): PriceInfo {
  const originalPrice = product.price;

  if (!product.discount) {
    return { finalPrice: originalPrice, originalPrice, hasDiscount: false, discountLabel: "", discountPercent: 0, isExpired: false };
  }

  const { type, value, label, expiresAt } = product.discount;

  // Check expiry
  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false;
  if (isExpired) {
    return { finalPrice: originalPrice, originalPrice, hasDiscount: false, discountLabel: "", discountPercent: 0, isExpired: true };
  }

  let finalPrice: number;
  let discountPercent: number;

  if (type === "percentage") {
    discountPercent = Math.min(value, 100);
    finalPrice = Math.round(originalPrice * (1 - discountPercent / 100));
  } else {
    finalPrice = Math.max(0, originalPrice - value);
    discountPercent = Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
  }

  const discountLabel = label || (type === "percentage" ? `${value}% OFF` : `Hemat Rp ${value.toLocaleString("id-ID")}`);

  return { finalPrice, originalPrice, hasDiscount: true, discountLabel, discountPercent, isExpired: false };
}

export function formatRp(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

export function generateSKU(category: string, existingCount: number = 0): string {
  const abbr = category.slice(0, 3).toUpperCase();
  const num = String(existingCount + 1).padStart(3, "0");
  return `KNL-${abbr}-${num}`;
}
