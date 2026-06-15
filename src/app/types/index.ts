export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  stock?: number;
  rating?: number;
  reviewCount?: number;
  sellerId?: string;
  sellerName?: string;
}

export interface Seller {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "craftsman";
  avatar?: string;
  bio?: string;
  location?: string;
  joinedAt: string;
  rating: number;
  totalSales: number;
  responseRate: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  verified: boolean;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  notes?: string;
}

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  orderId?: string;
  category: "product" | "delivery" | "service" | "payment" | "other";
  subject: string;
  description: string;
  status: "open" | "in-progress" | "resolved" | "closed";
  createdAt: string;
  updatedAt: string;
  responses?: ComplaintResponse[];
}

export interface ComplaintResponse {
  id: string;
  complaintId: string;
  responderId: string;
  responderName: string;
  message: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: "customer" | "craftsman" | "admin";
  message: string;
  createdAt: string;
  read: boolean;
}

export interface ChatConversation {
  id: string;
  customerId: string;
  customerName: string;
  sellerId: string;
  sellerName: string;
  productId?: string;
  productName?: string;
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  messages: ChatMessage[];
}

export interface RestockRequest {
  id: string;
  sellerId: string;
  productId: string;
  productName: string;
  currentStock: number;
  requestedAmount: number;
  status: "pending" | "approved" | "fulfilled" | "rejected";
  reason: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnRequest {
  id: string;
  customerId: string;
  customerName: string;
  orderId: string;
  productId: string;
  productName: string;
  sellerId: string;
  sellerName: string;
  reason: "defective" | "wrong_item" | "not_as_described" | "changed_mind" | "other";
  description: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  refundAmount: number;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  sellerNote?: string;
}
