/**
 * useProducts — single source of truth for the full product catalogue.
 *
 * Merges:
 *   1. Static products from data/products.ts
 *   2. Seller-added / admin-added custom products (from SellerProductContext)
 *   3. Live stock overrides (from StockContext)
 *
 * Product identity: custom products win over static ones on id collision
 * (handles the "promoted edit" pattern in SellerProductContext).
 *
 * This is intentionally a thin wrapper — it does not own any state itself;
 * the underlying contexts handle persistence via localStorage.
 */
import { useStock } from "../context/StockContext";
import { useSellerProducts } from "../context/SellerProductContext";
import { Product } from "../types";

export function useProducts(): Product[] {
  const { products: stockProducts } = useStock();          // static + stock overrides
  const { getAllCustomProducts } = useSellerProducts();     // seller & admin additions

  const customProducts = getAllCustomProducts();

  // stockProducts already contains static products with live stock applied.
  // Custom products fill in ids not present in the static list.
  const map = new Map<string, Product>(stockProducts.map(p => [p.id, p]));
  customProducts.forEach(p => {
    // Custom products (including promoted edits) override their base version.
    // Apply live stock override if available.
    if (!map.has(p.id)) {
      map.set(p.id, p);
    }
  });

  return Array.from(map.values());
}
