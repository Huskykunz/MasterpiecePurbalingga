import { useState, useEffect, useRef } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useRestock } from "../context/RestockContext";
import { useReturn } from "../context/ReturnContext";
import { useOrders } from "../context/OrderContext";
import { useReviews } from "../context/ReviewContext";
import { products } from "../data/products";
import { sellers } from "../data/sellers";
import { toast } from "sonner";
import {
  User, ShoppingBag, MessageCircle, RefreshCw, RotateCcw, LogOut,
  Star, Package, Send, Plus, X, Check, Clock,
  Store, BarChart2, Bell, TrendingUp, TrendingDown, Award, ShoppingCart
} from "lucide-react";
import { ReturnRequest } from "../types";

type Tab =
  | "profile"
  | "orders"
  | "chat"
  | "returns"
  | "seller-stats"
  | "seller-orders"
  | "seller-products"
  | "seller-reviews"
  | "seller-chat"
  | "seller-restock"
  | "seller-returns"
  | "seller-profile";

const formatRp = (n: number) => `Rp ${n.toLocaleString("id-ID")}`;
const formatDate = (s: string) => new Date(s).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });
const formatTime = (s: string) => new Date(s).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

export default function AccountPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { conversations, getConversationsByUser, getConversationsBySeller, sendMessage, startConversation, markAsRead } = useChat();
  const { requests: restockRequests, getRequestsBySeller, addRequest: addRestock, updateStatus: updateRestockStatus } = useRestock();
  const { returns, getReturnsByCustomer, getReturnsBySeller, requestReturn, updateReturnStatus } = useReturn();
  const { orders, getSellerOrders } = useOrders();
  const { getSellerReviews, getProductReviews } = useReviews();

  const isSeller = user?.role === "craftsman";
  const defaultTab: Tab = isSeller ? "seller-stats" : "profile";

  // Seller computed data
  const sellerProductIds = products.filter(p => p.sellerId === user?.id).map(p => p.id);
  const sellerAllOrders = user ? getSellerOrders(user.id) : [];
  const sellerAllReviews = getSellerReviews(sellerProductIds);
  const totalRevenue = sellerAllOrders.filter(o => o.status !== "cancelled")
    .reduce((s, o) => s + o.items.filter(i => (i as any).sellerId === user?.id || sellerProductIds.includes(i.id)).reduce((a, i) => a + i.price * i.quantity, 0), 0);
  const avgRating = sellerAllReviews.length ? (sellerAllReviews.reduce((s, r) => s + r.rating, 0) / sellerAllReviews.length) : 0;
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get("tab") as Tab) || defaultTab);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [returnModal, setReturnModal] = useState<{ orderId: string; productId: string; productName: string; sellerId: string; sellerName: string; price: number } | null>(null);
  const [returnForm, setReturnForm] = useState({ reason: "defective" as ReturnRequest["reason"], description: "" });
  const [restockModal, setRestockModal] = useState(false);
  const [restockForm, setRestockForm] = useState({ productId: "", amount: 10, reason: "" });
  const [sellerReturnNote, setSellerReturnNote] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [selectedConvId, conversations]);

  if (!user) return <Navigate to="/login" replace />;

  const myOrders = orders.filter((o) => o.userId === user.id);
  const myConversations = isSeller ? getConversationsBySeller(user.id) : getConversationsByUser(user.id);
  const myReturns = isSeller ? getReturnsBySeller(user.id) : getReturnsByCustomer(user.id);
  const myRestocks = getRequestsBySeller(user.id);
  const sellerProducts = products.filter((p) => p.sellerId === user.id);
  const selectedConv = myConversations.find((c) => c.id === selectedConvId);

  const handleSendMessage = () => {
    if (!chatInput.trim() || !selectedConvId) return;
    sendMessage(selectedConvId, user.id, user.name, user.role === "craftsman" ? "craftsman" : "customer", chatInput.trim());
    setChatInput("");
  };

  const handleSelectConv = (id: string) => {
    setSelectedConvId(id);
    markAsRead(id, user.id);
  };

  const handleLogout = () => { logout(); navigate("/"); toast.success("Berhasil keluar"); };

  const handleSubmitReturn = () => {
    if (!returnModal || !returnForm.description.trim()) return;
    requestReturn({
      customerId: user.id,
      customerName: user.name,
      orderId: returnModal.orderId,
      productId: returnModal.productId,
      productName: returnModal.productName,
      sellerId: returnModal.sellerId,
      sellerName: returnModal.sellerName,
      reason: returnForm.reason,
      description: returnForm.description,
      refundAmount: returnModal.price,
    });
    toast.success("Permintaan retur berhasil dikirim");
    setReturnModal(null);
    setReturnForm({ reason: "defective", description: "" });
  };

  const handleSubmitRestock = () => {
    if (!restockForm.productId || !restockForm.reason.trim()) return;
    const product = products.find((p) => p.id === restockForm.productId);
    if (!product) return;
    addRestock({
      sellerId: user.id,
      productId: product.id,
      productName: product.name,
      currentStock: product.stock || 0,
      requestedAmount: restockForm.amount,
      reason: restockForm.reason,
    });
    toast.success("Permintaan restock berhasil dikirim");
    setRestockModal(false);
    setRestockForm({ productId: "", amount: 10, reason: "" });
  };

  const statusColor: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    accepted: "bg-green-100 text-green-700",
    rejected: "bg-red-100 text-red-700",
    completed: "bg-gray-100 text-gray-700",
    approved: "bg-blue-100 text-blue-700",
    fulfilled: "bg-green-100 text-green-700",
  };

  const statusLabel: Record<string, string> = {
    pending: "Menunggu",
    processing: "Diproses",
    shipped: "Dikirim",
    delivered: "Selesai",
    cancelled: "Dibatalkan",
    accepted: "Diterima",
    rejected: "Ditolak",
    completed: "Selesai",
    approved: "Disetujui",
    fulfilled: "Terpenuhi",
    "not_as_described": "Tidak Sesuai",
    defective: "Produk Cacat",
    wrong_item: "Item Salah",
    changed_mind: "Berubah Pikiran",
    other: "Lainnya",
  };

  const customerMenu: { tab: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { tab: "profile", label: "Profil Saya", icon: User },
    { tab: "orders", label: "Pesanan Saya", icon: ShoppingBag, count: myOrders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length },
    { tab: "chat", label: "Chat Penjual", icon: MessageCircle, count: myConversations.reduce((s, c) => s + c.unreadCount, 0) },
    { tab: "returns", label: "Pengembalian", icon: RotateCcw, count: myReturns.filter(r => r.status === "pending").length },
  ];

  const sellerMenu: { tab: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { tab: "seller-stats", label: "Statistik Toko", icon: BarChart2 },
    { tab: "seller-orders", label: "Riwayat Pesanan", icon: ShoppingCart },
    { tab: "seller-products", label: "Produk Saya", icon: Package },
    { tab: "seller-reviews", label: "Ulasan Pembeli", icon: Star, count: sellerAllReviews.length },
    { tab: "seller-chat", label: "Chat Pembeli", icon: MessageCircle, count: myConversations.reduce((s, c) => s + c.unreadCount, 0) },
    { tab: "seller-restock", label: "Restock", icon: RefreshCw, count: myRestocks.filter(r => r.status === "pending").length },
    { tab: "seller-returns", label: "Retur Masuk", icon: RotateCcw, count: myReturns.filter(r => r.status === "pending").length },
    { tab: "seller-profile", label: "Profil Toko", icon: Store },
  ];

  const menuItems = isSeller ? sellerMenu : customerMenu;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-400">{isSeller ? "Penjual" : "Pembeli"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
            <button onClick={() => navigate("/shop")} className="text-sm text-blue-600 hover:underline">Belanja</button>
            <button onClick={handleLogout} className="text-sm text-red-500 hover:underline">Keluar</button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 flex gap-5">
        {/* Sidebar */}
        <aside className="w-56 flex-shrink-0">
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 mb-3">
            <nav className="space-y-0.5">
              {menuItems.map(({ tab, label, icon: Icon, count }) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-colors ${activeTab === tab ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4" />
                    {label}
                  </div>
                  {count && count > 0 ? (
                    <span className="bg-blue-600 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">{count}</span>
                  ) : null}
                </button>
              ))}
              <div className="border-t border-gray-100 pt-1 mt-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" /> Keluar
                </button>
              </div>
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">

          {/* ===== PROFILE TAB ===== */}
          {activeTab === "profile" && (
            <div className="bg-white rounded shadow p-6">
              <h2 className="text-lg font-semibold mb-4 border-b pb-3">Profil Saya</h2>
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xl font-semibold">{user.name}</p>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                  <span className="inline-block mt-1 text-xs bg-orange-100 text-blue-600 px-2 py-0.5 rounded-full">{isSeller ? "Penjual" : "Pembeli"}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center border-t pt-4">
                <div><p className="text-2xl font-bold text-blue-600">{myOrders.length}</p><p className="text-xs text-gray-500">Total Pesanan</p></div>
                <div><p className="text-2xl font-bold text-blue-600">{myReturns.length}</p><p className="text-xs text-gray-500">Pengembalian</p></div>
                <div><p className="text-2xl font-bold text-blue-600">{myConversations.length}</p><p className="text-xs text-gray-500">Chat Aktif</p></div>
              </div>
            </div>
          )}

          {/* ===== ORDERS TAB ===== */}
          {activeTab === "orders" && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold">Pesanan Saya</h2>
              </div>
              {myOrders.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Belum ada pesanan</p>
                  <button onClick={() => navigate("/shop")} className="mt-3 text-blue-600 text-sm hover:underline">Mulai belanja</button>
                </div>
              ) : (
                <div className="divide-y">
                  {myOrders.map((order) => (
                    <div key={order.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400">#{order.id}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[order.status]}`}>
                          {statusLabel[order.status]}
                        </span>
                      </div>
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 mb-2">
                          <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-gray-400">x{item.quantity} · {item.sellerName || "Penjual"}</p>
                          </div>
                          <p className="text-sm font-semibold text-blue-600">{formatRp(item.price * item.quantity)}</p>
                        </div>
                      ))}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t">
                        <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                        <div className="flex items-center gap-2">
                          <p className="text-sm">Total: <span className="font-semibold text-blue-600">{formatRp(order.total)}</span></p>
                          {order.status === "delivered" && (
                            <button
                              onClick={() => {
                                const item = order.items[0];
                                const prod = products.find(p => p.id === item.id);
                                if (prod) setReturnModal({ orderId: order.id, productId: item.id, productName: item.name, sellerId: prod.sellerId || "", sellerName: prod.sellerName || "", price: item.price });
                              }}
                              className="text-xs border border-blue-600 text-blue-600 px-3 py-1 rounded hover:bg-blue-50"
                            >
                              Ajukan Retur
                            </button>
                          )}
                          {/* Chat seller */}
                          <button
                            onClick={() => {
                              const item = order.items[0];
                              const prod = products.find(p => p.id === item.id);
                              if (prod?.sellerId) {
                                const conv = startConversation(user.id, user.name, prod.sellerId, prod.sellerName || "", prod.id, prod.name);
                                setSelectedConvId(conv.id);
                                setActiveTab("chat");
                              }
                            }}
                            className="text-xs border border-gray-300 text-gray-600 px-3 py-1 rounded hover:bg-gray-50"
                          >
                            Chat Penjual
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== CUSTOMER CHAT TAB ===== */}
          {(activeTab === "chat" || activeTab === "seller-chat") && (
            <div className="bg-white rounded shadow flex h-[600px]">
              {/* Conversation list */}
              <div className="w-64 border-r flex flex-col flex-shrink-0">
                <div className="p-3 border-b bg-gray-50">
                  <p className="text-sm font-semibold text-gray-700">{isSeller ? "Chat Pembeli" : "Chat Penjual"}</p>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {myConversations.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-sm">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      Belum ada percakapan
                    </div>
                  ) : (
                    myConversations.map((conv) => (
                      <button
                        key={conv.id}
                        onClick={() => handleSelectConv(conv.id)}
                        className={`w-full text-left p-3 border-b hover:bg-gray-50 transition-colors ${selectedConvId === conv.id ? "bg-orange-50 border-l-2 border-l-[#ee4d2d]" : ""}`}
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{isSeller ? conv.customerName : conv.sellerName}</p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-blue-600 text-white text-xs rounded-full px-1.5">{conv.unreadCount}</span>
                          )}
                        </div>
                        {conv.productName && <p className="text-xs text-gray-400 truncate">{conv.productName}</p>}
                        {conv.lastMessage && <p className="text-xs text-gray-500 truncate mt-0.5">{conv.lastMessage}</p>}
                      </button>
                    ))
                  )}
                </div>
              </div>
              {/* Message area */}
              <div className="flex-1 flex flex-col">
                {selectedConv ? (
                  <>
                    <div className="p-3 border-b bg-gray-50 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                        {(isSeller ? selectedConv.customerName : selectedConv.sellerName).charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{isSeller ? selectedConv.customerName : selectedConv.sellerName}</p>
                        {selectedConv.productName && <p className="text-xs text-gray-400">{selectedConv.productName}</p>}
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {selectedConv.messages.length === 0 && (
                        <div className="text-center text-gray-400 text-sm mt-8">Mulai percakapan...</div>
                      )}
                      {selectedConv.messages.map((msg) => {
                        const isMe = msg.senderId === user.id;
                        return (
                          <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${isMe ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                              <p>{msg.message}</p>
                              <p className={`text-xs mt-0.5 ${isMe ? "text-blue-100" : "text-gray-400"}`}>{formatTime(msg.createdAt)}</p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="p-3 border-t flex items-center gap-2">
                      <input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Ketik pesan..."
                        className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-blue-600"
                      />
                      <button
                        onClick={handleSendMessage}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-orange-600 transition-colors"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Pilih percakapan</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===== CUSTOMER RETURNS TAB ===== */}
          {activeTab === "returns" && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Pengembalian Barang</h2>
                <p className="text-sm text-gray-400">Ajukan retur dari halaman "Pesanan Saya"</p>
              </div>
              {myReturns.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <RotateCcw className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Belum ada pengajuan retur</p>
                </div>
              ) : (
                <div className="divide-y">
                  {myReturns.map((ret) => (
                    <div key={ret.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{ret.productName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[ret.status]}`}>
                          {statusLabel[ret.status]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mb-1">Alasan: {statusLabel[ret.reason] || ret.reason}</p>
                      <p className="text-xs text-gray-500 mb-1">{ret.description}</p>
                      {ret.sellerNote && <p className="text-xs bg-blue-50 text-blue-700 p-2 rounded mt-1">Catatan penjual: {ret.sellerNote}</p>}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-400">{formatDate(ret.createdAt)}</p>
                        <p className="text-sm font-semibold text-blue-600">Refund: {formatRp(ret.refundAmount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== SELLER PROFILE TAB ===== */}
          {/* ===== SELLER STATS ===== */}
          {activeTab === "seller-stats" && (() => {
            const sellerData = sellers.find(s => s.id === user.id);
            const delivered = sellerAllOrders.filter(o => o.status === "delivered").length;
            const pending = sellerAllOrders.filter(o => o.status === "pending").length;
            const processing = sellerAllOrders.filter(o => o.status === "processing").length;
            const cancelled = sellerAllOrders.filter(o => o.status === "cancelled").length;
            const totalOrders = sellerAllOrders.length;

            // Revenue by product
            const revenueByProduct: Record<string, { name: string; revenue: number; sold: number }> = {};
            sellerAllOrders.filter(o => o.status !== "cancelled").forEach(o => {
              o.items.filter(i => sellerProductIds.includes(i.id)).forEach(item => {
                if (!revenueByProduct[item.id]) revenueByProduct[item.id] = { name: item.name, revenue: 0, sold: 0 };
                revenueByProduct[item.id].revenue += item.price * item.quantity;
                revenueByProduct[item.id].sold += item.quantity;
              });
            });
            const topProducts = Object.values(revenueByProduct).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

            return (
              <div className="space-y-5">
                {/* KPI cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Pendapatan", value: formatRp(totalRevenue), icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
                    { label: "Total Pesanan", value: totalOrders.toString(), icon: ShoppingCart, color: "text-violet-600", bg: "bg-violet-50" },
                    { label: "Rating Toko", value: avgRating ? avgRating.toFixed(1) + " ★" : "—", icon: Star, color: "text-amber-600", bg: "bg-amber-50" },
                    { label: "Ulasan Masuk", value: sellerAllReviews.length.toString(), icon: Award, color: "text-green-600", bg: "bg-green-50" },
                  ].map(({ label, value, icon: Icon, color, bg }) => (
                    <div key={label} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                      <div className={`inline-flex items-center justify-center w-10 h-10 ${bg} rounded-xl mb-3`}>
                        <Icon className={`h-5 w-5 ${color}`} />
                      </div>
                      <p className={`text-2xl font-bold ${color}`}>{value}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Order status breakdown */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 mb-4">Status Pesanan</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "Menunggu", count: pending, color: "bg-yellow-100 text-yellow-700" },
                      { label: "Diproses", count: processing, color: "bg-blue-100 text-blue-700" },
                      { label: "Selesai", count: delivered, color: "bg-green-100 text-green-700" },
                      { label: "Dibatalkan", count: cancelled, color: "bg-red-100 text-red-700" },
                    ].map(({ label, count, color }) => (
                      <div key={label} className={`${color} rounded-xl p-4 text-center`}>
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-xs mt-0.5 opacity-80">{label}</p>
                      </div>
                    ))}
                  </div>
                  {totalOrders > 0 && (
                    <div className="mt-4">
                      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
                        {pending > 0 && <div className="bg-yellow-400" style={{ width: `${pending / totalOrders * 100}%` }} />}
                        {processing > 0 && <div className="bg-blue-400" style={{ width: `${processing / totalOrders * 100}%` }} />}
                        {delivered > 0 && <div className="bg-green-400" style={{ width: `${delivered / totalOrders * 100}%` }} />}
                        {cancelled > 0 && <div className="bg-red-300" style={{ width: `${cancelled / totalOrders * 100}%` }} />}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Tingkat penyelesaian: {totalOrders > 0 ? Math.round(delivered / totalOrders * 100) : 0}%</p>
                    </div>
                  )}
                </div>

                {/* Top products */}
                {topProducts.length > 0 && (
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Produk Terlaris</h3>
                    <div className="space-y-3">
                      {topProducts.map((p, i) => {
                        const prod = products.find(pr => pr.name === p.name);
                        const maxRevenue = topProducts[0].revenue;
                        return (
                          <div key={p.name} className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-400 w-5">#{i + 1}</span>
                            {prod && <img src={prod.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                              <div className="mt-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${(p.revenue / maxRevenue) * 100}%` }} />
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="text-sm font-bold text-blue-600">{formatRp(p.revenue)}</p>
                              <p className="text-xs text-gray-400">{p.sold} terjual</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {totalOrders === 0 && (
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-12 text-center">
                    <BarChart2 className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400">Belum ada data statistik. Mulai berjualan untuk melihat performa toko Anda.</p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ===== SELLER ORDER HISTORY ===== */}
          {activeTab === "seller-orders" && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Riwayat Pesanan Masuk</h2>
                <span className="text-sm text-gray-400">{sellerAllOrders.length} pesanan</span>
              </div>
              {sellerAllOrders.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Belum ada pesanan masuk</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {sellerAllOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => {
                    const myItems = order.items.filter(i => sellerProductIds.includes(i.id));
                    const myTotal = myItems.reduce((s, i) => s + i.price * i.quantity, 0);
                    const statusColor: Record<string, string> = {
                      pending: "bg-yellow-100 text-yellow-700",
                      processing: "bg-blue-100 text-blue-700",
                      shipped: "bg-purple-100 text-purple-700",
                      delivered: "bg-green-100 text-green-700",
                      cancelled: "bg-red-100 text-red-700",
                    };
                    const statusLabel: Record<string, string> = { pending: "Menunggu", processing: "Diproses", shipped: "Dikirim", delivered: "Selesai", cancelled: "Dibatalkan" };
                    return (
                      <div key={order.id} className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="text-xs text-gray-400 font-mono">{order.id}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)} · {order.shippingAddress.fullName}</p>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[order.status]}`}>
                            {statusLabel[order.status]}
                          </span>
                        </div>
                        {myItems.map(item => (
                          <div key={item.id} className="flex items-center gap-3 mb-2">
                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-xl" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                              <p className="text-xs text-gray-400">x{item.quantity}</p>
                            </div>
                            <p className="text-sm font-semibold text-blue-600">{formatRp(item.price * item.quantity)}</p>
                          </div>
                        ))}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-2">
                          <p className="text-xs text-gray-400">{myItems.length} produk</p>
                          <p className="text-sm font-bold text-gray-900">Total: <span className="text-blue-600">{formatRp(myTotal)}</span></p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ===== SELLER REVIEWS ===== */}
          {activeTab === "seller-reviews" && (
            <div className="space-y-4">
              {/* Summary card */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
                <h2 className="font-bold text-gray-900 mb-4">Ringkasan Ulasan</h2>
                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-5xl font-bold text-amber-500">{avgRating ? avgRating.toFixed(1) : "—"}</p>
                    <div className="flex gap-0.5 justify-center mt-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`h-4 w-4 ${avgRating >= s ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{sellerAllReviews.length} ulasan</p>
                  </div>
                  <div className="flex-1 space-y-1.5">
                    {[5,4,3,2,1].map(star => {
                      const count = sellerAllReviews.filter(r => r.rating === star).length;
                      const pct = sellerAllReviews.length ? (count / sellerAllReviews.length) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 w-4">{star}</span>
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 w-6">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Per-product reviews */}
              {sellerProducts.map(product => {
                const prodReviews = getProductReviews(product.id);
                if (prodReviews.length === 0) return null;
                const avgProd = prodReviews.reduce((s, r) => s + r.rating, 0) / prodReviews.length;
                return (
                  <div key={product.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex items-center gap-4 p-5 border-b border-gray-50">
                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{product.name}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[1,2,3,4,5].map(s => <Star key={s} className={`h-3 w-3 ${avgProd >= s ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />)}
                          <span className="text-xs text-gray-400 ml-1">{avgProd.toFixed(1)} ({prodReviews.length})</span>
                        </div>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {prodReviews.map(review => (
                        <div key={review.id} className="p-5">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                {review.userName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{review.userName}</p>
                                <div className="flex gap-0.5">
                                  {[1,2,3,4,5].map(s => <Star key={s} className={`h-3 w-3 ${review.rating >= s ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />)}
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400">{formatDate(review.date)}</p>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                          {review.verified && (
                            <span className="inline-flex items-center gap-1 mt-2 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                              <Check className="h-3 w-3" /> Pembelian Terverifikasi
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {sellerAllReviews.length === 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-12 text-center">
                  <Star className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400">Belum ada ulasan dari pembeli.</p>
                </div>
              )}
            </div>
          )}

          {/* ===== SELLER PROFILE TAB ===== */}
          {activeTab === "seller-profile" && (
            <div className="bg-white rounded shadow p-6">
              <h2 className="text-lg font-semibold mb-4 border-b pb-3">Profil Toko</h2>
              {(() => {
                const sellerData = sellers.find(s => s.id === user.id);
                return (
                  <div>
                    <div className="flex items-center gap-6 mb-6">
                      <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-xl font-semibold">{user.name}</p>
                        <p className="text-gray-500 text-sm">{user.email}</p>
                        {sellerData && <p className="text-xs text-gray-400 mt-1">{sellerData.location}</p>}
                      </div>
                    </div>
                    {sellerData && (
                      <>
                        <p className="text-sm text-gray-600 mb-4">{sellerData.bio}</p>
                        <div className="grid grid-cols-3 gap-4 text-center border-t pt-4">
                          <div><p className="text-2xl font-bold text-blue-600">{sellerData.rating}</p><p className="text-xs text-gray-500">Rating</p></div>
                          <div><p className="text-2xl font-bold text-blue-600">{sellerData.totalSales}</p><p className="text-xs text-gray-500">Total Terjual</p></div>
                          <div><p className="text-2xl font-bold text-blue-600">{sellerData.responseRate}%</p><p className="text-xs text-gray-500">Respon</p></div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ===== SELLER PRODUCTS TAB ===== */}
          {activeTab === "seller-products" && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold">Produk Saya ({sellerProducts.length})</h2>
              </div>
              {sellerProducts.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <Package className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Belum ada produk</p>
                </div>
              ) : (
                <div className="divide-y">
                  {sellerProducts.map((product) => (
                    <div key={product.id} className="p-4 flex items-center gap-4">
                      <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.category}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm font-semibold text-blue-600">{formatRp(product.price)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${(product.stock || 0) > 10 ? "bg-green-100 text-green-700" : (product.stock || 0) > 0 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                            Stok: {product.stock || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-yellow-500 text-xs">
                          <Star className="h-3 w-3 fill-yellow-400" />
                          {product.rating}
                        </div>
                        <button
                          onClick={() => { setRestockForm({ productId: product.id, amount: 10, reason: "" }); setRestockModal(true); }}
                          className="text-xs border border-blue-600 text-blue-600 px-3 py-1 rounded hover:bg-blue-50"
                        >
                          Restock
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== SELLER RESTOCK TAB ===== */}
          {activeTab === "seller-restock" && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="p-4 border-b flex items-center justify-between">
                <h2 className="text-lg font-semibold">Permintaan Restock</h2>
                <button
                  onClick={() => setRestockModal(true)}
                  className="flex items-center gap-1 bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4" /> Ajukan Restock
                </button>
              </div>
              {myRestocks.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <RefreshCw className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Belum ada permintaan restock</p>
                </div>
              ) : (
                <div className="divide-y">
                  {myRestocks.map((req) => (
                    <div key={req.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium text-sm">{req.productName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[req.status]}`}>
                          {statusLabel[req.status]}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>Stok saat ini: <strong>{req.currentStock}</strong></span>
                        <span>Diminta: <strong className="text-blue-600">+{req.requestedAmount}</strong></span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{req.reason}</p>
                      <p className="text-xs text-gray-300 mt-1">{formatDate(req.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== SELLER RETURNS TAB ===== */}
          {activeTab === "seller-returns" && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Retur Masuk</h2>
              </div>
              {myReturns.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <RotateCcw className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Belum ada permintaan retur</p>
                </div>
              ) : (
                <div className="divide-y">
                  {myReturns.map((ret) => (
                    <div key={ret.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{ret.productName}</p>
                          <p className="text-xs text-gray-400">Dari: {ret.customerName}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[ret.status]}`}>
                          {statusLabel[ret.status]}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">Alasan: {statusLabel[ret.reason] || ret.reason}</p>
                      <p className="text-xs text-gray-500 mb-2">{ret.description}</p>
                      <p className="text-sm font-semibold text-blue-600 mb-2">Refund: {formatRp(ret.refundAmount)}</p>
                      {ret.status === "pending" && (
                        <div className="flex items-start gap-2">
                          <input
                            placeholder="Catatan untuk pembeli (opsional)..."
                            className="flex-1 border rounded px-3 py-1.5 text-xs focus:outline-none focus:border-blue-600"
                            value={sellerReturnNote}
                            onChange={(e) => setSellerReturnNote(e.target.value)}
                          />
                          <button
                            onClick={() => { updateReturnStatus(ret.id, "accepted", sellerReturnNote); setSellerReturnNote(""); toast.success("Retur diterima"); }}
                            className="flex items-center gap-1 bg-green-500 text-white text-xs px-3 py-1.5 rounded hover:bg-green-600"
                          >
                            <Check className="h-3 w-3" /> Terima
                          </button>
                          <button
                            onClick={() => { updateReturnStatus(ret.id, "rejected", sellerReturnNote); setSellerReturnNote(""); toast.error("Retur ditolak"); }}
                            className="flex items-center gap-1 bg-red-500 text-white text-xs px-3 py-1.5 rounded hover:bg-red-600"
                          >
                            <X className="h-3 w-3" /> Tolak
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Return Modal */}
      {returnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Ajukan Pengembalian</h3>
              <button onClick={() => setReturnModal(null)}><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Produk</p>
                <p className="font-medium text-sm">{returnModal.productName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Alasan Retur</label>
                <select
                  value={returnForm.reason}
                  onChange={(e) => setReturnForm({ ...returnForm, reason: e.target.value as ReturnRequest["reason"] })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
                >
                  <option value="defective">Produk Cacat</option>
                  <option value="wrong_item">Item Salah Dikirim</option>
                  <option value="not_as_described">Tidak Sesuai Deskripsi</option>
                  <option value="changed_mind">Berubah Pikiran</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Deskripsi</label>
                <textarea
                  value={returnForm.description}
                  onChange={(e) => setReturnForm({ ...returnForm, description: e.target.value })}
                  placeholder="Jelaskan masalah lebih detail..."
                  rows={3}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>
              <p className="text-sm">Estimasi Refund: <span className="font-semibold text-blue-600">{formatRp(returnModal.price)}</span></p>
            </div>
            <div className="p-4 border-t flex gap-2 justify-end">
              <button onClick={() => setReturnModal(null)} className="border px-4 py-2 rounded text-sm text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={handleSubmitReturn} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-600">Kirim Permintaan</button>
            </div>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {restockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Ajukan Restock</h3>
              <button onClick={() => setRestockModal(false)}><X className="h-5 w-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm text-gray-600 block mb-1">Pilih Produk</label>
                <select
                  value={restockForm.productId}
                  onChange={(e) => setRestockForm({ ...restockForm, productId: e.target.value })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
                >
                  <option value="">-- Pilih Produk --</option>
                  {sellerProducts.map((p) => (
                    <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Jumlah Restock</label>
                <input
                  type="number"
                  min={1}
                  value={restockForm.amount}
                  onChange={(e) => setRestockForm({ ...restockForm, amount: parseInt(e.target.value) || 1 })}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 block mb-1">Alasan</label>
                <textarea
                  value={restockForm.reason}
                  onChange={(e) => setRestockForm({ ...restockForm, reason: e.target.value })}
                  placeholder="Alasan pengajuan restock..."
                  rows={3}
                  className="w-full border rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>
            </div>
            <div className="p-4 border-t flex gap-2 justify-end">
              <button onClick={() => setRestockModal(false)} className="border px-4 py-2 rounded text-sm text-gray-600 hover:bg-gray-50">Batal</button>
              <button onClick={handleSubmitRestock} className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-orange-600">Ajukan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
