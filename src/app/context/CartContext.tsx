import { createContext, useContext, useState, ReactNode, useRef } from "react";
import { toast } from "sonner";
import { CartItem, Product } from "../types";
import { getDiscountedPrice } from "../utils/priceUtils";

// Stock check injected at runtime to avoid circular imports.
// Set by StockProvider after mount via setCartStockGetter().
let externalGetStock: ((id: string) => number) | null = null;
export function setCartStockGetter(fn: (id: string) => number) {
  externalGetStock = fn;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, isAuthenticated?: boolean) => boolean;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const lastToastTime = useRef<number>(0);
  const currentToastId = useRef<string | number | undefined>(undefined);
  const COOLDOWN = 1000;

  const addToCart = (product: Product, isAuthenticated = false): boolean => {
    const now = Date.now();

    if (!isAuthenticated) {
      if (now - lastToastTime.current >= COOLDOWN) {
        if (currentToastId.current !== undefined) toast.dismiss(currentToastId.current);
        currentToastId.current = toast.warning("Silakan masuk terlebih dahulu", {
          description: "Login atau daftar untuk menambahkan produk ke keranjang",
          action: { label: "Login", onClick: () => { window.location.href = "/login"; } },
        });
        lastToastTime.current = now;
      }
      return false;
    }

    // ── Stock check ────────────────────────────────────────────────
    const availableStock = externalGetStock ? externalGetStock(product.id) : (product.stock ?? Infinity);
    const inCart = cart.find(i => i.id === product.id)?.quantity ?? 0;

    if (availableStock === 0) {
      toast.error("Stok habis", { description: `${product.name} sudah tidak tersedia` });
      return false;
    }
    if (inCart >= availableStock) {
      toast.error("Stok tidak mencukupi", { description: `Maksimal ${availableStock} unit untuk produk ini` });
      return false;
    }

    // ── Lock the discounted price at the time of adding ────────────
    const { finalPrice, hasDiscount } = getDiscountedPrice(product);
    const effectivePrice = hasDiscount ? finalPrice : product.price;

    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...product, price: effectivePrice, quantity: 1 }];
    });

    if (now - lastToastTime.current >= COOLDOWN) {
      if (currentToastId.current !== undefined) toast.dismiss(currentToastId.current);
      currentToastId.current = toast.success("Ditambahkan ke keranjang", {
        description: `${product.name}${hasDiscount ? ` (harga diskon diterapkan)` : ""}`,
        duration: 2000,
      });
      lastToastTime.current = now;
    }
    return true;
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(i => i.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) { removeFromCart(productId); return; }

    // Stock check on quantity update
    if (externalGetStock) {
      const available = externalGetStock(productId);
      if (quantity > available) {
        toast.error("Stok tidak mencukupi", { description: `Maksimal ${available} unit tersedia` });
        return;
      }
    }

    setCart(prev => prev.map(i => i.id === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => setCart([]);

  // Subtotal uses the locked effectivePrice stored in each CartItem
  const getTotalPrice = () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const getItemCount = () => cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotalPrice, getItemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
