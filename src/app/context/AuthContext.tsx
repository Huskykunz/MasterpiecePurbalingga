import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { sellers } from "../data/sellers";

interface User {
  id: string;
  name: string;
  email: string;
  role: "customer" | "craftsman" | "admin";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ── SHA-256 via Web Crypto (browser-native, no library needed) ───────────────
async function hashPassword(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// Seed the registeredUsers store with all demo + seller accounts (hashed) if not already done.
// We use a versioned key so re-hashing happens if we update the seed list.
const SEED_VERSION = "v3-hashed";
async function ensureSeedAccounts() {
  if (localStorage.getItem("accountSeedVersion") === SEED_VERSION) return;

  const plainAccounts = [
    { id: "demo-1",   name: "Demo User",           email: "demo@masterpiece.com",     password: "demo123",     role: "customer" },
    { id: "demo-2",   name: "Test Customer",        email: "customer@test.com",        password: "customer123", role: "customer" },
    { id: "admin-1",  name: "Admin Masterpiece",    email: "admin@masterpiece.com",    password: "admin123",    role: "admin" },
    // Sellers from sellers.ts
    ...sellers.map(s => ({ id: s.id, name: s.name, email: s.email, password: s.password, role: s.role })),
  ];

  const existing: any[] = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
  const existingIds = new Set(existing.map((u: any) => u.id));
  const existingEmails = new Set(existing.map((u: any) => u.email));

  const toAdd = plainAccounts.filter(a => !existingIds.has(a.id) && !existingEmails.has(a.email));

  const hashed = await Promise.all(
    toAdd.map(async a => ({ ...a, password: await hashPassword(a.password) }))
  );

  // Also hash any existing accounts that still store plaintext passwords (migration).
  const migrated = await Promise.all(
    existing.map(async (u: any) => {
      // Heuristic: SHA-256 hex is always 64 chars. If shorter, it's plaintext.
      if (u.password && u.password.length < 64) {
        return { ...u, password: await hashPassword(u.password) };
      }
      return u;
    })
  );

  localStorage.setItem("registeredUsers", JSON.stringify([...migrated, ...hashed]));
  localStorage.setItem("accountSeedVersion", SEED_VERSION);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  // Run seed on mount (async, safe to run every time — version guard prevents duplicates)
  useEffect(() => { ensureSeedAccounts(); }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const hashed = await hashPassword(password);
    const registeredUsers: any[] = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const found = registeredUsers.find(u => u.email === email && u.password === hashed);
    if (!found) throw new Error("Invalid credentials");
    const { password: _pw, ...userWithoutPassword } = found;
    setUser(userWithoutPassword as User);
  };

  const register = async (name: string, email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const registeredUsers: any[] = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    if (registeredUsers.some(u => u.email === email)) throw new Error("Email already registered");

    const newUser: User = { id: Date.now().toString(), name, email, role: "customer" };
    const hashed = await hashPassword(password);
    registeredUsers.push({ ...newUser, password: hashed });
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));
    setUser(newUser);
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
