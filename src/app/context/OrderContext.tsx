import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Order, ShippingAddress, CartItem } from "../types";

interface OrderContextType {
  orders: Order[];
  createOrder: (
    userId: string,
    items: CartItem[],
    total: number,
    shippingAddress: ShippingAddress,
    paymentMethod: string
  ) => Order;
  getUserOrders: (userId: string) => Order[];
  getSellerOrders: (sellerId: string) => Order[];
  getOrder: (orderId: string) => Order | undefined;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem("orders");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  const createOrder = (
    userId: string,
    items: CartItem[],
    total: number,
    shippingAddress: ShippingAddress,
    paymentMethod: string
  ): Order => {
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      userId,
      items,
      total,
      status: "pending",
      shippingAddress,
      paymentMethod,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    return newOrder;
  };

  const getUserOrders = (userId: string) => {
    return orders.filter((order) => order.userId === userId);
  };

  const getSellerOrders = (sellerId: string) => {
    return orders.filter((order) =>
      order.items.some((item) => (item as any).sellerId === sellerId)
    );
  };

  const getOrder = (orderId: string) => {
    return orders.find((order) => order.id === orderId);
  };

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date().toISOString() }
          : order
      )
    );
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        getUserOrders,
        getSellerOrders,
        getOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider");
  }
  return context;
}
