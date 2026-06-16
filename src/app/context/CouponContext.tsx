import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder: number;
  maxDiscount?: number;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  description?: string;
  createdAt: string;
}

interface CouponContextType {
  coupons: Coupon[];
  addCoupon: (coupon: Omit<Coupon, "id" | "createdAt" | "usedCount">) => void;
  deleteCoupon: (id: string) => void;
  toggleCoupon: (id: string) => void;
  validateCoupon: (code: string, subtotal: number) => { valid: boolean; coupon?: Coupon; error?: string };
  applyCoupon: (code: string) => void;
  calculateDiscount: (coupon: Coupon, subtotal: number) => number;
}

const CouponContext = createContext<CouponContextType | undefined>(undefined);

const STORAGE_KEY = "coupons";
const SEED_VERSION = "v1";

const loadCoupons = (): Coupon[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
};
const saveCoupons = (data: Coupon[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

// ── Seed data ────────────────────────────────────────────────────────────────
function buildSeedCoupons(): Coupon[] {
  const now = new Date();
  const plus = (months: number) => {
    const d = new Date(now);
    d.setMonth(d.getMonth() + months);
    return d.toISOString();
  };
  const base = { usedCount: 0, createdAt: now.toISOString() };

  return [
    {
      ...base,
      id: "seed-1",
      code: "WELCOME10",
      type: "percentage",
      value: 10,
      minOrder: 50000,
      maxDiscount: 30000,
      expiresAt: plus(12),
      usageLimit: 1000,
      isActive: true,
      description: "Diskon 10% untuk pelanggan baru",
    },
    {
      ...base,
      id: "seed-2",
      code: "HEMAT25K",
      type: "fixed",
      value: 25000,
      minOrder: 100000,
      expiresAt: plus(6),
      usageLimit: 500,
      isActive: true,
      description: "Potongan Rp 25.000 untuk pembelian di atas Rp 100.000",
    },
    {
      ...base,
      id: "seed-3",
      code: "GRATIS50",
      type: "fixed",
      value: 50000,
      minOrder: 200000,
      expiresAt: plus(3),
      usageLimit: 200,
      isActive: true,
      description: "Potongan Rp 50.000 untuk pembelian di atas Rp 200.000",
    },
    {
      ...base,
      id: "seed-4",
      code: "DISKON20",
      type: "percentage",
      value: 20,
      minOrder: 150000,
      maxDiscount: 75000,
      expiresAt: plus(2),
      usageLimit: 100,
      isActive: true,
      description: "Diskon 20% maksimal Rp 75.000",
    },
    {
      ...base,
      id: "seed-5",
      code: "MASTERPIECE",
      type: "percentage",
      value: 15,
      minOrder: 75000,
      maxDiscount: 50000,
      expiresAt: plus(12),
      usageLimit: 9999,
      isActive: true,
      description: "Kode spesial Masterpiece — bisa dipakai kapan saja",
    },
  ];
}

function seedIfNeeded() {
  if (localStorage.getItem("couponSeedVersion") === SEED_VERSION) return;

  const existing: Coupon[] = loadCoupons();
  const existingIds = new Set(existing.map(c => c.id));
  const existingCodes = new Set(existing.map(c => c.code));

  const seeds = buildSeedCoupons().filter(
    s => !existingIds.has(s.id) && !existingCodes.has(s.code)
  );

  saveCoupons([...existing, ...seeds]);
  localStorage.setItem("couponSeedVersion", SEED_VERSION);
}

// ── Provider ─────────────────────────────────────────────────────────────────
export function CouponProvider({ children }: { children: ReactNode }) {
  // Seed runs synchronously before first state initialisation
  seedIfNeeded();

  const [coupons, setCoupons] = useState<Coupon[]>(loadCoupons);

  const update = (fn: (prev: Coupon[]) => Coupon[]) => {
    setCoupons(prev => {
      const next = fn(prev);
      saveCoupons(next);
      return next;
    });
  };

  const addCoupon = (coupon: Omit<Coupon, "id" | "createdAt" | "usedCount">) => {
    const newCoupon: Coupon = {
      ...coupon,
      id: `coupon-${Date.now()}`,
      usedCount: 0,
      createdAt: new Date().toISOString(),
    };
    update(prev => [...prev, newCoupon]);
  };

  const deleteCoupon = (id: string) => {
    update(prev => prev.filter(c => c.id !== id));
  };

  const toggleCoupon = (id: string) => {
    update(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  const validateCoupon = (
    code: string,
    subtotal: number
  ): { valid: boolean; coupon?: Coupon; error?: string } => {
    const upper = code.trim().toUpperCase();
    const coupon = coupons.find(c => c.code.toUpperCase() === upper);

    if (!coupon) return { valid: false, error: "Kode kupon tidak ditemukan" };
    if (!coupon.isActive) return { valid: false, error: "Kupon ini tidak aktif" };
    if (new Date(coupon.expiresAt) < new Date()) return { valid: false, error: "Kupon sudah kadaluarsa" };
    if (coupon.usedCount >= coupon.usageLimit) return { valid: false, error: "Batas penggunaan kupon telah habis" };
    if (subtotal < coupon.minOrder) {
      const diff = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(coupon.minOrder - subtotal);
      return { valid: false, error: `Minimal pembelian ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(coupon.minOrder)} (tambah ${diff} lagi)` };
    }

    return { valid: true, coupon };
  };

  const applyCoupon = (code: string) => {
    const upper = code.trim().toUpperCase();
    update(prev =>
      prev.map(c =>
        c.code.toUpperCase() === upper ? { ...c, usedCount: c.usedCount + 1 } : c
      )
    );
  };

  const calculateDiscount = (coupon: Coupon, subtotal: number): number => {
    if (coupon.type === "percentage") {
      const raw = Math.round(subtotal * (coupon.value / 100));
      return coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
    }
    return Math.min(coupon.value, subtotal);
  };

  return (
    <CouponContext.Provider value={{
      coupons,
      addCoupon,
      deleteCoupon,
      toggleCoupon,
      validateCoupon,
      applyCoupon,
      calculateDiscount,
    }}>
      {children}
    </CouponContext.Provider>
  );
}

export function useCoupon() {
  const ctx = useContext(CouponContext);
  if (!ctx) throw new Error("useCoupon must be within CouponProvider");
  return ctx;
}
