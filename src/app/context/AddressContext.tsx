import { createContext, useContext, useState, ReactNode } from "react";
import { ShippingAddress } from "../types";

export interface SavedAddress extends ShippingAddress {
  id: string;
  label: string;       // e.g. "Rumah", "Kantor"
  isDefault: boolean;
}

interface AddressContextType {
  addresses: SavedAddress[];
  getDefaultAddress: () => SavedAddress | undefined;
  getUserAddresses: (userId: string) => SavedAddress[];
  addAddress: (userId: string, address: Omit<SavedAddress, "id">) => SavedAddress;
  updateAddress: (id: string, updates: Partial<Omit<SavedAddress, "id">>) => void;
  deleteAddress: (id: string) => void;
  setDefault: (id: string, userId: string) => void;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

const STORAGE_KEY = "savedAddresses";
const load = (): SavedAddress[] => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
};
const save = (data: SavedAddress[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

export function AddressProvider({ children }: { children: ReactNode }) {
  const [addresses, setAddresses] = useState<SavedAddress[]>(load);

  const update = (fn: (prev: SavedAddress[]) => SavedAddress[]) => {
    setAddresses(prev => { const next = fn(prev); save(next); return next; });
  };

  const getUserAddresses = (userId: string) =>
    addresses.filter(a => (a as any).userId === userId);

  const getDefaultAddress = () =>
    addresses.find(a => a.isDefault);

  const addAddress = (userId: string, address: Omit<SavedAddress, "id">): SavedAddress => {
    const isFirst = getUserAddresses(userId).length === 0;
    const newAddr: SavedAddress & { userId: string } = {
      ...address,
      id: `addr-${Date.now()}`,
      userId,
      isDefault: isFirst || address.isDefault,
    };
    // If this is being set as default, clear other defaults for this user
    update(prev => {
      const cleared = newAddr.isDefault
        ? prev.map(a => (a as any).userId === userId ? { ...a, isDefault: false } : a)
        : prev;
      return [...cleared, newAddr];
    });
    return newAddr;
  };

  const updateAddress = (id: string, updates: Partial<Omit<SavedAddress, "id">>) => {
    update(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const deleteAddress = (id: string) => {
    update(prev => {
      const filtered = prev.filter(a => a.id !== id);
      // If deleted was default, promote first remaining for that user
      const deleted = prev.find(a => a.id === id);
      if (deleted?.isDefault) {
        const userId = (deleted as any).userId;
        const remaining = filtered.filter(a => (a as any).userId === userId);
        if (remaining.length > 0) {
          return filtered.map(a => a.id === remaining[0].id ? { ...a, isDefault: true } : a);
        }
      }
      return filtered;
    });
  };

  const setDefault = (id: string, userId: string) => {
    update(prev =>
      prev.map(a =>
        (a as any).userId === userId ? { ...a, isDefault: a.id === id } : a
      )
    );
  };

  return (
    <AddressContext.Provider value={{ addresses, getDefaultAddress, getUserAddresses, addAddress, updateAddress, deleteAddress, setDefault }}>
      {children}
    </AddressContext.Provider>
  );
}

export function useAddress() {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error("useAddress must be within AddressProvider");
  return ctx;
}
