import { createContext, useContext, useState, ReactNode, useEffect, useRef } from "react";
import { Order, ShippingAddress, CartItem } from "../types";

// Stock deduction + check injected by StockProvider to avoid circular imports
let externalDeductStock: ((id: string, qty: number) => void) | null = null;
let externalCheckStock: ((id: string, qty: number) => boolean) | null = null;
export function setOrderStockFns(
  deduct: (id: string, qty: number) => void,
  check: (id: string, qty: number) => boolean
) {
  externalDeductStock = deduct;
  externalCheckStock = check;
}

// Timestamps of when each order reached "shipped" — stored outside Order to avoid
// polluting localStorage order objects with simulation metadata.
const TS_KEY = "order_shipped_at";
const loadTs = (): Record<string, number> => {
  try { return JSON.parse(localStorage.getItem(TS_KEY) || "{}"); } catch { return {}; }
};
const saveTs = (t: Record<string, number>) => localStorage.setItem(TS_KEY, JSON.stringify(t));

// Delays (ms)
const DELAY_TO_PROCESSING = 8_000;     // 8 s  → "Diproses"
const DELAY_TO_SHIPPED    = 20_000;    // 20 s → "Dikirim"
const DELAY_TO_COMPLETABLE = 5 * 60_000; // 5 min after shipped

const SHIPPING_MESSAGES = [
  "Barang sedang dikirim via kurir JNE",
  "Paket dalam perjalanan ke alamat Anda",
  "Barang telah diserahkan ke ekspedisi",
  "Kurir sedang menuju lokasi pengiriman Anda",
  "Paket dalam transit — estimasi tiba 1–3 hari",
];

const CANCEL_WINDOW = 10 * 60_000; // 10 minutes after order creation

interface OrderContextType {
  orders: Order[];
  createOrder: (userId: string, items: CartItem[], total: number, shippingAddress: ShippingAddress, paymentMethod: string) => Order;
  getUserOrders: (userId: string) => Order[];
  getSellerOrders: (sellerId: string) => Order[];
  getOrder: (orderId: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  completeOrder: (orderId: string) => void;
  canComplete: (orderId: string) => boolean;
  cancelOrder: (orderId: string) => void;
  canCancel: (orderId: string) => boolean;
  getShippingMessage: (orderId: string) => string | null;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("orders");
    return saved ? JSON.parse(saved) : [];
  });

  const shippedAt = useRef<Record<string, number>>(loadTs());

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  // Advance a single order to the next status
  const advance = (orderId: string, status: Order["status"]) => {
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o)
    );
    if (status === "shipped") {
      const ts = Date.now();
      shippedAt.current = { ...shippedAt.current, [orderId]: ts };
      saveTs(shippedAt.current);
    }
  };

  // Start simulation pipeline for a pending order
  const simulate = (orderId: string) => {
    setTimeout(() => {
      setOrders(prev => {
        const o = prev.find(x => x.id === orderId);
        if (!o || o.status !== "pending") return prev;
        return prev.map(x => x.id === orderId ? { ...x, status: "processing", updatedAt: new Date().toISOString() } : x);
      });

      setTimeout(() => {
        setOrders(prev => {
          const o = prev.find(x => x.id === orderId);
          if (!o || o.status !== "processing") return prev;
          const ts = Date.now();
          shippedAt.current = { ...shippedAt.current, [orderId]: ts };
          saveTs(shippedAt.current);
          return prev.map(x => x.id === orderId ? { ...x, status: "shipped", updatedAt: new Date().toISOString() } : x);
        });
      }, DELAY_TO_SHIPPED);
    }, DELAY_TO_PROCESSING);
  };

  // Re-attach timers on mount for in-flight orders (page reload survival)
  useEffect(() => {
    orders.forEach(order => {
      if (order.status === "pending") {
        const elapsed = Date.now() - new Date(order.updatedAt).getTime();
        const remainingProcessing = Math.max(0, DELAY_TO_PROCESSING - elapsed);
        setTimeout(() => {
          setOrders(prev => {
            const o = prev.find(x => x.id === order.id);
            if (!o || o.status !== "pending") return prev;
            return prev.map(x => x.id === order.id ? { ...x, status: "processing", updatedAt: new Date().toISOString() } : x);
          });
          setTimeout(() => {
            setOrders(prev => {
              const o = prev.find(x => x.id === order.id);
              if (!o || o.status !== "processing") return prev;
              const ts = Date.now();
              shippedAt.current = { ...shippedAt.current, [order.id]: ts };
              saveTs(shippedAt.current);
              return prev.map(x => x.id === order.id ? { ...x, status: "shipped", updatedAt: new Date().toISOString() } : x);
            });
          }, DELAY_TO_SHIPPED);
        }, remainingProcessing);
      }
      if (order.status === "processing") {
        const elapsed = Date.now() - new Date(order.updatedAt).getTime();
        const remaining = Math.max(0, DELAY_TO_SHIPPED - elapsed);
        setTimeout(() => {
          setOrders(prev => {
            const o = prev.find(x => x.id === order.id);
            if (!o || o.status !== "processing") return prev;
            const ts = Date.now();
            shippedAt.current = { ...shippedAt.current, [order.id]: ts };
            saveTs(shippedAt.current);
            return prev.map(x => x.id === order.id ? { ...x, status: "shipped", updatedAt: new Date().toISOString() } : x);
          });
        }, remaining);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createOrder = (
    userId: string, items: CartItem[], total: number,
    shippingAddress: ShippingAddress, paymentMethod: string
  ): Order => {
    // ── Stock availability check ───────────────────────────────────
    if (externalCheckStock) {
      for (const item of items) {
        if (!externalCheckStock(item.id, item.quantity)) {
          throw new Error(`Stok tidak mencukupi untuk "${item.name}". Silakan perbarui keranjang Anda.`);
        }
      }
    }

    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      userId, items, total, status: "pending",
      shippingAddress, paymentMethod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOrders(prev => [newOrder, ...prev]);
    simulate(newOrder.id);

    // ── Deduct stock for each item ordered ─────────────────────────
    if (externalDeductStock) {
      items.forEach(item => externalDeductStock!(item.id, item.quantity));
    }

    return newOrder;
  };

  const getUserOrders = (userId: string) => orders.filter(o => o.userId === userId);
  const getSellerOrders = (sellerId: string) =>
    orders.filter(o => o.items.some(i => (i as any).sellerId === sellerId));
  const getOrder = (orderId: string) => orders.find(o => o.id === orderId);
  const updateOrderStatus = (orderId: string, status: Order["status"]) => advance(orderId, status);

  const canComplete = (orderId: string): boolean => {
    const o = orders.find(x => x.id === orderId);
    if (!o || o.status !== "shipped") return false;
    const ts = shippedAt.current[orderId];
    return !!ts && Date.now() - ts >= DELAY_TO_COMPLETABLE;
  };

  const completeOrder = (orderId: string) => {
    if (canComplete(orderId)) advance(orderId, "delivered");
  };

  // Cancel is allowed within 10 minutes of creation, and only if not yet shipped/delivered
  const canCancel = (orderId: string): boolean => {
    const o = orders.find(x => x.id === orderId);
    if (!o) return false;
    if (o.status === "shipped" || o.status === "delivered" || o.status === "cancelled") return false;
    return Date.now() - new Date(o.createdAt).getTime() <= CANCEL_WINDOW;
  };

  const cancelOrder = (orderId: string) => {
    if (!canCancel(orderId)) return;
    advance(orderId, "cancelled");
  };

  const getShippingMessage = (orderId: string): string | null => {
    const o = orders.find(x => x.id === orderId);
    if (!o || o.status !== "shipped") return null;
    const idx = parseInt(orderId.replace(/\D/g, "").slice(-2) || "0", 10) % SHIPPING_MESSAGES.length;
    return SHIPPING_MESSAGES[idx];
  };

  return (
    <OrderContext.Provider value={{ orders, createOrder, getUserOrders, getSellerOrders, getOrder, updateOrderStatus, completeOrder, canComplete, cancelOrder, canCancel, getShippingMessage }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be within OrderProvider");
  return ctx;
}
