import { Seller } from "../types";

const in30Days = () => {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString();
};

export const sellers: Seller[] = [
  {
    id: "seller-1",
    name: "Bengkel Jaya Motor",
    email: "jaya@masterpiece.com",
    password: "seller123",
    role: "craftsman",
    avatar: "https://ui-avatars.com/api/?name=Jaya+Motor&background=ee4d2d&color=fff&size=128",
    bio: "Bengkel knalpot terpercaya di Purbalingga. Spesialis knalpot sport dan racing dengan pengalaman 10 tahun.",
    location: "Purbalingga, Jawa Tengah",
    joinedAt: "2022-01-15",
    rating: 4.8,
    totalSales: 342,
    responseRate: 98,
    subscriptionPlan: "silver",
    subscriptionExpiry: in30Days(),
  },
  {
    id: "seller-2",
    name: "Workshop Exhaust Pro",
    email: "exhaustpro@masterpiece.com",
    password: "seller123",
    role: "craftsman",
    avatar: "https://ui-avatars.com/api/?name=Exhaust+Pro&background=f05d23&color=fff&size=128",
    bio: "Produsen knalpot custom premium. Setiap produk dibuat handmade dengan bahan berkualitas tinggi.",
    location: "Banyumas, Jawa Tengah",
    joinedAt: "2021-06-20",
    rating: 4.9,
    totalSales: 578,
    responseRate: 95,
    subscriptionPlan: "silver",
    subscriptionExpiry: in30Days(),
  },
  {
    id: "seller-3",
    name: "Knalpot Nusantara",
    email: "nusantara@masterpiece.com",
    password: "seller123",
    role: "craftsman",
    avatar: "https://ui-avatars.com/api/?name=Knalpot+Nusantara&background=d0011b&color=fff&size=128",
    bio: "Pengrajin knalpot lokal dengan sentuhan tradisional. Kami menghadirkan produk berkualitas ekspor.",
    location: "Cilacap, Jawa Tengah",
    joinedAt: "2023-03-10",
    rating: 4.7,
    totalSales: 189,
    responseRate: 92,
    subscriptionPlan: "free",
    subscriptionExpiry: null,
  },
];

export const initializeSellers = () => {
  const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
  const sellerExists = registeredUsers.some((u: any) => u.id === "seller-1");
  if (!sellerExists) {
    const updatedUsers = [...registeredUsers, ...sellers];
    localStorage.setItem("registeredUsers", JSON.stringify(updatedUsers));
  }
  // Store sellers data separately for easy lookup
  localStorage.setItem("sellers", JSON.stringify(sellers));
};

export const getSellers = (): Seller[] => {
  const stored = localStorage.getItem("sellers");
  return stored ? JSON.parse(stored) : sellers;
};
