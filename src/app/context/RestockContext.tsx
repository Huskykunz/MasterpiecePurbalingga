import { createContext, useContext, useState, ReactNode } from "react";
import { RestockRequest } from "../types";

// addStock injected by StockContext to avoid circular import
let externalAddStock: ((productId: string, amount: number) => void) | null = null;
export function setRestockAddStockFn(fn: (productId: string, amount: number) => void) {
  externalAddStock = fn;
}

interface RestockContextType {
  requests: RestockRequest[];
  getRequestsBySeller: (sellerId: string) => RestockRequest[];
  addRequest: (req: Omit<RestockRequest, "id" | "createdAt" | "updatedAt" | "status">) => void;
  updateStatus: (id: string, status: RestockRequest["status"]) => void;
  fulfillRestock: (id: string, newStock: number) => void;
}

const RestockContext = createContext<RestockContextType | undefined>(undefined);

const load = (): RestockRequest[] => {
  try { return JSON.parse(localStorage.getItem("restockRequests") || "[]"); } catch { return []; }
};
const save = (data: RestockRequest[]) => localStorage.setItem("restockRequests", JSON.stringify(data));

export function RestockProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<RestockRequest[]>(load);

  const update = (fn: (prev: RestockRequest[]) => RestockRequest[]) => {
    setRequests(prev => { const next = fn(prev); save(next); return next; });
  };

  const getRequestsBySeller = (sellerId: string) =>
    requests.filter(r => r.sellerId === sellerId);

  const addRequest = (req: Omit<RestockRequest, "id" | "createdAt" | "updatedAt" | "status">) => {
    const now = new Date().toISOString();
    const newReq: RestockRequest = {
      ...req,
      id: `restock-${Date.now()}`,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    update(prev => [...prev, newReq]);
  };

  const updateStatus = (id: string, status: RestockRequest["status"]) => {
    update(prev =>
      prev.map(r => r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r)
    );
  };

  const fulfillRestock = (id: string, newStock: number) => {
    // Mark as fulfilled AND actually add the stock
    update(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        // Inject stock addition via the registered addStock function
        if (externalAddStock) {
          externalAddStock(r.productId, newStock);
        }
        return { ...r, status: "fulfilled" as const, updatedAt: new Date().toISOString() };
      })
    );
  };

  return (
    <RestockContext.Provider value={{ requests, getRequestsBySeller, addRequest, updateStatus, fulfillRestock }}>
      {children}
    </RestockContext.Provider>
  );
}

export function useRestock() {
  const ctx = useContext(RestockContext);
  if (!ctx) throw new Error("useRestock must be within RestockProvider");
  return ctx;
}
