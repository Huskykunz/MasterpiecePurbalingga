import { createContext, useContext, useState, ReactNode } from "react";
import { Product } from "../types";
import { products as staticProducts } from "../data/products";

interface SellerProductContextType {
  getAllSellerProducts: (sellerId: string) => Product[];
  getAllCustomProducts: () => Product[];
  addProduct: (product: Omit<Product, "id">) => Product;
  updateProduct: (id: string, updates: Partial<Omit<Product, "id">>) => void;
  deleteProduct: (id: string) => void;
}

const SellerProductContext = createContext<SellerProductContextType | undefined>(undefined);

const STORAGE_KEY = "sellerCustomProducts";
const DELETED_KEY = "sellerDeletedProductIds";

const loadCustom = (): Product[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
};
const saveCustom = (p: Product[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(p));

const loadDeleted = (): string[] => {
  try { return JSON.parse(localStorage.getItem(DELETED_KEY) || "[]"); } catch { return []; }
};
const saveDeleted = (ids: string[]) => localStorage.setItem(DELETED_KEY, JSON.stringify(ids));

export function SellerProductProvider({ children }: { children: ReactNode }) {
  const [customProducts, setCustomProducts] = useState<Product[]>(loadCustom);
  const [deletedIds, setDeletedIds] = useState<string[]>(loadDeleted);

  // All custom products for a specific seller (used in seller dashboard)
  const getAllSellerProducts = (sellerId: string): Product[] => {
    const fromStatic = staticProducts.filter(
      p => p.sellerId === sellerId && !deletedIds.includes(p.id)
    );
    const fromCustom = customProducts.filter(
      p => p.sellerId === sellerId && !deletedIds.includes(p.id)
    );
    return [...fromStatic, ...fromCustom];
  };

  // All custom products regardless of seller — used by Shop.tsx to surface
  // seller-added products in the storefront. Excludes soft-deleted ones.
  const getAllCustomProducts = (): Product[] =>
    customProducts.filter(p => !deletedIds.includes(p.id));

  const addProduct = (product: Omit<Product, "id">): Product => {
    const newProduct: Product = { ...product, id: `custom-${Date.now()}` };
    const next = [...customProducts, newProduct];
    setCustomProducts(next);
    saveCustom(next);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Omit<Product, "id">>) => {
    const isCustom = customProducts.some(p => p.id === id);

    if (isCustom) {
      const next = customProducts.map(p => p.id === id ? { ...p, ...updates } : p);
      setCustomProducts(next);
      saveCustom(next);
    } else {
      const original = staticProducts.find(p => p.id === id);
      if (!original) return;
      // Give the promoted copy a new ID so deletedIds doesn't catch it too
      const promoted: Product = { ...original, ...updates, id: `edit-${id}-${Date.now()}` };
      const nextCustom = [...customProducts, promoted];
      const nextDeleted = [...deletedIds, id];
      setCustomProducts(nextCustom);
      setDeletedIds(nextDeleted);
      saveCustom(nextCustom);
      saveDeleted(nextDeleted);
    }
  };

  const deleteProduct = (id: string) => {
    const nextCustom = customProducts.filter(p => p.id !== id);
    setCustomProducts(nextCustom);
    saveCustom(nextCustom);
    if (!deletedIds.includes(id)) {
      const nextDeleted = [...deletedIds, id];
      setDeletedIds(nextDeleted);
      saveDeleted(nextDeleted);
    }
  };

  return (
    <SellerProductContext.Provider value={{
      getAllSellerProducts,
      getAllCustomProducts,
      addProduct,
      updateProduct,
      deleteProduct,
    }}>
      {children}
    </SellerProductContext.Provider>
  );
}

export function useSellerProducts() {
  const ctx = useContext(SellerProductContext);
  if (!ctx) throw new Error("useSellerProducts must be within SellerProductProvider");
  return ctx;
}
