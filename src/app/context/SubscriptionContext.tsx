import { createContext, useContext, useState, ReactNode } from "react";
import { sellers as seedSellers } from "../data/sellers";

export type SubscriptionPlan = "free" | "silver";

interface SellerSubscription {
  sellerId: string;
  plan: SubscriptionPlan;
  expiry: string | null;
}

interface SubscriptionContextType {
  getSellerPlan: (sellerId: string) => SubscriptionPlan;
  getSellerExpiry: (sellerId: string) => string | null;
  upgradePlan: (sellerId: string, plan: SubscriptionPlan) => void;
  cancelPlan: (sellerId: string) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const STORAGE_KEY = "sellerSubscriptions";

const loadSubs = (): SellerSubscription[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
};
const saveSubs = (data: SellerSubscription[]) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

const seedSubscriptions = (): SellerSubscription[] => {
  const existing = loadSubs();
  const existingIds = new Set(existing.map(s => s.sellerId));
  const seeded = seedSellers
    .filter(s => !existingIds.has(s.id))
    .map(s => ({
      sellerId: s.id,
      plan: ((s.subscriptionPlan ?? "free") === "silver" ? "silver" : "free") as SubscriptionPlan,
      expiry: s.subscriptionExpiry ?? null,
    }));
  if (seeded.length > 0) {
    const merged = [...existing, ...seeded];
    saveSubs(merged);
    return merged;
  }
  return existing;
};

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subs, setSubs] = useState<SellerSubscription[]>(seedSubscriptions);

  const update = (fn: (prev: SellerSubscription[]) => SellerSubscription[]) => {
    setSubs(prev => { const next = fn(prev); saveSubs(next); return next; });
  };

  const getSellerPlan = (sellerId: string): SubscriptionPlan => {
    const sub = subs.find(s => s.sellerId === sellerId);
    if (!sub || sub.plan === "free") return "free";
    if (sub.expiry && new Date(sub.expiry) < new Date()) return "free";
    return sub.plan;
  };

  const getSellerExpiry = (sellerId: string): string | null =>
    subs.find(s => s.sellerId === sellerId)?.expiry ?? null;

  const upgradePlan = (sellerId: string, plan: SubscriptionPlan) => {
    const expiry = plan === "free"
      ? null
      : (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d.toISOString(); })();
    update(prev => {
      const exists = prev.some(s => s.sellerId === sellerId);
      if (exists) return prev.map(s => s.sellerId === sellerId ? { ...s, plan, expiry } : s);
      return [...prev, { sellerId, plan, expiry }];
    });
  };

  const cancelPlan = (sellerId: string) => {
    update(prev => prev.map(s => s.sellerId === sellerId ? { ...s, plan: "free", expiry: null } : s));
  };

  return (
    <SubscriptionContext.Provider value={{ getSellerPlan, getSellerExpiry, upgradePlan, cancelPlan }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error("useSubscription must be within SubscriptionProvider");
  return ctx;
}
