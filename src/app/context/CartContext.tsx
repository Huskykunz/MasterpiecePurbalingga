import { createContext, useContext, useState, ReactNode, useRef } from "react";
import { toast } from "sonner";
import { CartItem, Product } from "../types";

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

  const addToCart = (product: Product, isAuthenticated: boolean = false): boolean => {
    const now = Date.now();
    const TOAST_COOLDOWN = 1000; // 1 second cooldown between toasts

    // Check if user is authenticated
    if (!isAuthenticated) {
      // Only show auth toast if cooldown has passed
      if (now - lastToastTime.current >= TOAST_COOLDOWN) {
        // Dismiss previous toast if it exists
        if (currentToastId.current !== undefined) {
          toast.dismiss(currentToastId.current);
        }

        currentToastId.current = toast.warning("Silakan buat akun terlebih dahulu", {
          description: "Anda perlu masuk atau mendaftar untuk menambahkan produk ke keranjang",
          action: {
            label: "Login",
            onClick: () => {
              window.location.href = "/login";
            },
          },
        });
        lastToastTime.current = now;
      }
      return false;
    }

    // Add product to cart
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });

    // Show success notification with cooldown
    if (now - lastToastTime.current >= TOAST_COOLDOWN) {
      // Dismiss previous toast if it exists
      if (currentToastId.current !== undefined) {
        toast.dismiss(currentToastId.current);
      }

      currentToastId.current = toast.success("Produk berhasil ditambahkan ke keranjang", {
        description: `${product.name} telah ditambahkan`,
        duration: 2000, // Auto-dismiss after 2 seconds
      });
      lastToastTime.current = now;
    }

    return true;
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
