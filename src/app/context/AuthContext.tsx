import { createContext, useContext, useState, ReactNode, useEffect } from "react";

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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Load user from localStorage on initial render
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Initialize demo accounts on first load
  useEffect(() => {
    const registeredUsers = localStorage.getItem("registeredUsers");
    if (!registeredUsers) {
      // Create demo accounts
      const demoAccounts = [
        {
          id: "demo-1",
          name: "Demo User",
          email: "demo@masterpiece.com",
          password: "demo123",
          role: "customer",
        },
        {
          id: "demo-2",
          name: "Test Customer",
          email: "customer@test.com",
          password: "customer123",
          role: "customer",
        },
      ];
      localStorage.setItem("registeredUsers", JSON.stringify(demoAccounts));
    }
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    // Simulasi login - nanti bisa diganti dengan API call
    // Simulasi delay untuk meniru API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if user exists in localStorage (registered users)
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const existingUser = registeredUsers.find((u: any) => u.email === email);

    if (existingUser && existingUser.password === password) {
      const { password: _, ...userWithoutPassword } = existingUser;
      setUser(userWithoutPassword);
    } else {
      throw new Error("Invalid credentials");
    }
  };

  const register = async (name: string, email: string, password: string) => {
    // Simulasi register - nanti bisa diganti dengan API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if email already exists
    const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
    const emailExists = registeredUsers.some((u: any) => u.email === email);

    if (emailExists) {
      throw new Error("Email already registered");
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role: "customer",
    };

    // Save to registered users with password
    const userWithPassword = { ...newUser, password };
    registeredUsers.push(userWithPassword);
    localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

    // Set as current user (without password)
    setUser(newUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
