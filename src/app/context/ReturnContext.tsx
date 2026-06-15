import { createContext, useContext, useState, ReactNode } from "react";
import { ReturnRequest } from "../types";

interface ReturnContextType {
  returns: ReturnRequest[];
  getReturnsByCustomer: (customerId: string) => ReturnRequest[];
  getReturnsBySeller: (sellerId: string) => ReturnRequest[];
  requestReturn: (req: Omit<ReturnRequest, "id" | "createdAt" | "updatedAt" | "status">) => void;
  updateReturnStatus: (id: string, status: ReturnRequest["status"], sellerNote?: string) => void;
}

const ReturnContext = createContext<ReturnContextType | undefined>(undefined);

const load = (): ReturnRequest[] => {
  try { return JSON.parse(localStorage.getItem("returnRequests") || "[]"); } catch { return []; }
};
const save = (data: ReturnRequest[]) => localStorage.setItem("returnRequests", JSON.stringify(data));

export function ReturnProvider({ children }: { children: ReactNode }) {
  const [returns, setReturns] = useState<ReturnRequest[]>(load);

  const update = (fn: (prev: ReturnRequest[]) => ReturnRequest[]) => {
    setReturns((prev) => { const next = fn(prev); save(next); return next; });
  };

  const getReturnsByCustomer = (customerId: string) => returns.filter((r) => r.customerId === customerId);
  const getReturnsBySeller = (sellerId: string) => returns.filter((r) => r.sellerId === sellerId);

  const requestReturn = (req: Omit<ReturnRequest, "id" | "createdAt" | "updatedAt" | "status">) => {
    const now = new Date().toISOString();
    const newReturn: ReturnRequest = { ...req, id: `return-${Date.now()}`, status: "pending", createdAt: now, updatedAt: now };
    update((prev) => [...prev, newReturn]);
  };

  const updateReturnStatus = (id: string, status: ReturnRequest["status"], sellerNote?: string) => {
    update((prev) => prev.map((r) =>
      r.id === id ? { ...r, status, updatedAt: new Date().toISOString(), ...(sellerNote ? { sellerNote } : {}) } : r
    ));
  };

  return (
    <ReturnContext.Provider value={{ returns, getReturnsByCustomer, getReturnsBySeller, requestReturn, updateReturnStatus }}>
      {children}
    </ReturnContext.Provider>
  );
}

export function useReturn() {
  const ctx = useContext(ReturnContext);
  if (!ctx) throw new Error("useReturn must be within ReturnProvider");
  return ctx;
}
