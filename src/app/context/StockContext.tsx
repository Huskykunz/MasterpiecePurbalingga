import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { products as initialProducts } from "../data/products";
import { Product } from "../types";
import { setCartStockGetter } from "./CartContext";
import { setOrderStockFns } from "./OrderContext";
import { setRestockAddStockFn } from "./RestockContext";

interface StockContextType {
  products: Product[];
  addStock: (productId: string, amount: number) => void;
  getStock: (productId: string) => number;
  deductStock: (productId: string, quantity: number) => void;
  checkStock: (productId: string, required: number) => boolean;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

const STOCK_KEY = "productStock";
const CUSTOM_KEY = "sellerCustomProducts";
const DELETED_KEY = "sellerDeletedProductIds";

const loadOverrides = (): Record<string, number> => {
  try { return JSON.parse(localStorage.getItem(STOCK_KEY) || "{}"); } catch { return {}; }
};
const persist = (data: Record<string, number>) =>
  localStorage.setItem(STOCK_KEY, JSON.stringify(data));

// Base stock: check static products first, then custom products in localStorage.
// Reads localStorage directly so custom products don't need a separate React state.
const baseStock = (id: string): number => {
  const staticP = initialProducts.find(p => p.id === id);
  if (staticP) return staticP.stock ?? 0;
  try {
    const custom: Product[] = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
    return custom.find(p => p.id === id)?.stock ?? 0;
  } catch { return 0; }
};

// Read all active custom products from localStorage (re-reads on every call so Shop
// always sees newly added seller products without needing a custom event).
const readActiveCustomProducts = (): Product[] => {
  try {
    const all: Product[] = JSON.parse(localStorage.getItem(CUSTOM_KEY) || "[]");
    const deleted: string[] = JSON.parse(localStorage.getItem(DELETED_KEY) || "[]");
    return all.filter(p => !deleted.includes(p.id));
  } catch { return []; }
};

export function StockProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, number>>(loadOverrides);

  const getStock = (id: string): number =>
    id in overrides ? overrides[id] : baseStock(id);

  const addStock = (productId: string, amount: number) => {
    setOverrides(prev => {
      const current = productId in prev ? prev[productId] : baseStock(productId);
      const next = { ...prev, [productId]: Math.max(0, current + amount) };
      persist(next);
      return next;
    });
  };

  const deductStock = (productId: string, quantity: number) => {
    setOverrides(prev => {
      const current = productId in prev ? prev[productId] : baseStock(productId);
      const next = { ...prev, [productId]: Math.max(0, current - quantity) };
      persist(next);
      return next;
    });
  };

  const checkStock = (productId: string, required: number): boolean =>
    getStock(productId) >= required;

  // Register with all consumers that need stock access without circular imports
  useEffect(() => {
    setCartStockGetter(getStock);
    setOrderStockFns(deductStock, checkStock);
    setRestockAddStockFn(addStock);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overrides]);

  // Build the products array on every render:
  // 1. Start with static products
  // 2. Merge custom products from localStorage (reads fresh each render)
  // 3. Custom products win on id collision (handles "promoted" static products)
  // 4. Apply stock overrides to all
  const baseMap = new Map<string, Product>();
  initialProducts.forEach(p => baseMap.set(p.id, p));
  readActiveCustomProducts().forEach(p => baseMap.set(p.id, p));

  const products: Product[] = Array.from(baseMap.values()).map(p => ({
    ...p,
    stock: getStock(p.id),
    inStock: getStock(p.id) > 0,
  }));

  return (
    <StockContext.Provider value={{ products, addStock, getStock, deductStock, checkStock }}>
      {children}
    </StockContext.Provider>
  );
}

export function useStock() {
  const ctx = useContext(StockContext);
  if (!ctx) throw new Error("useStock must be within StockProvider");
  return ctx;
}
