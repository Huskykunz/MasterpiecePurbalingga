import { useState, useEffect, useRef } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useRestock } from "../context/RestockContext";
import { useReturn } from "../context/ReturnContext";
import { useOrders } from "../context/OrderContext";
import { useReviews } from "../context/ReviewContext";
import { useStock } from "../context/StockContext";
import { useSellerProducts } from "../context/SellerProductContext";
import { OrdersTab } from "../components/OrdersTab";
import { useAddress, SavedAddress } from "../context/AddressContext";
import { useProducts } from "../hooks/useProducts";
import { sellers } from "../data/sellers";
import { toast } from "sonner";
import {
  User, ShoppingBag, MessageCircle, RefreshCw, RotateCcw, LogOut,
  Star, Package, Send, Plus, X, Check, Clock,
  Store, BarChart2, Bell, TrendingUp, TrendingDown, Award, ShoppingCart,
  Pencil, Trash2, Search, ImageIcon, Tag, Layers, AlertTriangle,
  MapPin, Home, Briefcase, Building2, CheckCircle2
} from "lucide-react";
import { ReturnRequest } from "../types";

type Tab =
  | "profile"
  | "orders"
  | "chat"
  | "returns"
  | "addresses"
  | "seller-stats"
  | "seller-orders"
  | "seller-products"
  | "seller-reviews"
  | "seller-chat"
  | "seller-restock"
  | "seller-returns";

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
  const { addStock, getStock } = useStock();
  const { getAllSellerProducts, addProduct, updateProduct, deleteProduct } = useSellerProducts();
  const { getUserAddresses, addAddress, updateAddress, deleteAddress, setDefault } = useAddress();

  // Address management state
  type AddrForm = { label: string; fullName: string; phone: string; address: string; city: string; province: string; postalCode: string; notes: string; isDefault: boolean; };
  const emptyAddr: AddrForm = { label: "Rumah", fullName: user?.name || "", phone: "", address: "", city: "", province: "", postalCode: "", notes: "", isDefault: false };
  const [addrModal, setAddrModal] = useState<{ mode: "add" | "edit"; id?: string } | null>(null);
  const [addrForm, setAddrForm] = useState<AddrForm>(emptyAddr);
  const [addrDeleteConfirm, setAddrDeleteConfirm] = useState<{ id: string; label: string } | null>(null);
  const [restockQty, setRestockQty] = useState<Record<string, number>>({});

  // Product management state
  type ProductForm = { name: string; description: string; price: string; category: string; image: string; stock: string; };
  const emptyForm: ProductForm = { name: "", description: "", price: "", category: "Sport", image: "", stock: "10" };
  const [productModal, setProductModal] = useState<{ mode: "add" | "edit"; productId?: string } | null>(null);
  const [productForm, setProductForm] = useState<ProductForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [productSearch, setProductSearch] = useState("");
  const categories = ["Sport", "Racing", "Custom", "Titanium", "Street", "Performance", "Carbon", "Cruiser", "Stainless", "Black", "Universal", "GP"];
  const { getSellerReviews, getProductReviews } = useReviews();

  const isSeller = user?.role === "craftsman";
  const defaultTab: Tab = isSeller ? "seller-stats" : "profile";

  // Live product catalogue — single source of truth shared across all roles
  const products = useProducts();

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
  const [restockForm, setRestockForm] = useState({ productId: "none", amount: 10, reason: "" });
  const [sellerReturnNote, setSellerReturnNote] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [selectedConvId, conversations]);

  if (!user) return <Navigate to="/login" replace />;

  const myOrders = orders.filter((o) => o.userId === user.id);
  const myConversations = isSeller ? getConversationsBySeller(user.id) : getConversationsByUser(user.id);
  const myReturns = isSeller ? getReturnsBySeller(user.id) : getReturnsByCustomer(user.id);
  const myRestocks = getRequestsBySeller(user.id);
  const sellerProducts = user ? getAllSellerProducts(user.id) : [];
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
    if (!restockForm.productId || restockForm.productId === "none" || !restockForm.reason.trim()) return;
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
    setRestockForm({ productId: "none", amount: 10, reason: "" });
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

  const myAddresses = getUserAddresses(user.id);

  const customerMenu: { tab: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { tab: "profile", label: "Profil Saya", icon: User },
    { tab: "orders", label: "Pesanan Saya", icon: ShoppingBag, count: myOrders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length },
    { tab: "addresses", label: "Alamat Saya", icon: MapPin, count: myAddresses.length || undefined },
    { tab: "chat", label: "Chat Penjual", icon: MessageCircle, count: myConversations.reduce((s, c) => s + c.unreadCount, 0) },
    { tab: "returns", label: "Pengembalian", icon: RotateCcw, count: myReturns.filter(r => r.status === "pending").length },
  ];

  const sellerMenu: { tab: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { tab: "seller-stats", label: "Profil & Statistik", icon: BarChart2 },
    { tab: "seller-orders", label: "Riwayat Pesanan", icon: ShoppingCart },
    { tab: "seller-products", label: "Produk Saya", icon: Package },
    { tab: "seller-reviews", label: "Ulasan Pembeli", icon: Star, count: sellerAllReviews.length },
    { tab: "seller-chat", label: "Chat Pembeli", icon: MessageCircle, count: myConversations.reduce((s, c) => s + c.unreadCount, 0) },
    { tab: "seller-restock", label: "Restock", icon: RefreshCw, count: myRestocks.filter(r => r.status === "pending").length },
    { tab: "seller-returns", label: "Retur Masuk", icon: RotateCcw, count: myReturns.filter(r => r.status === "pending").length },
  ];

  const menuItems = isSeller ? sellerMenu : customerMenu;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white font-bold text-sm">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 text-sm truncate">{user.name}</p>
              <p className="text-xs text-gray-400">{isSeller ? "Penjual" : "Pembeli"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Bell className="h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600" />
            <button onClick={() => navigate("/shop")} className="hidden sm:block text-sm text-blue-600 hover:underline">Belanja</button>
          </div>
        </div>
      </div>

      {/* ── Mobile tab strip (hidden on md+) ── */}
      <div className="md:hidden bg-white border-b border-gray-100 sticky top-14 z-20">
        <div className="flex overflow-x-auto scrollbar-hide px-3 py-0">
          {menuItems.map(({ tab, label, icon: Icon, count }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              {count && count > 0 ? (
                <span className={`text-[9px] font-bold px-1 rounded-full ${activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"}`}>{count}</span>
              ) : null}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="flex-shrink-0 flex flex-col items-center gap-0.5 px-3.5 py-2.5 text-xs font-medium border-b-2 border-transparent text-red-400 whitespace-nowrap"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-4 md:py-6 md:flex md:gap-5">
        {/* Sidebar — desktop only */}
        <aside className="hidden md:block w-56 flex-shrink-0">
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
            <OrdersTab userId={user.id} userName={user.name} />
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

          {/* ===== ADDRESSES TAB ===== */}
          {activeTab === "addresses" && (
            <div className="space-y-4">
              {/* Header */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900">Alamat Saya</h2>
                  <p className="text-sm text-gray-400 mt-0.5">{myAddresses.length} alamat tersimpan</p>
                </div>
                <button
                  onClick={() => { setAddrForm({ ...emptyAddr, fullName: user.name }); setAddrModal({ mode: "add" }); }}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                >
                  <Plus className="h-4 w-4" /> Tambah Alamat
                </button>
              </div>

              {/* Address list */}
              {myAddresses.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-14 text-center">
                  <MapPin className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Belum ada alamat tersimpan</p>
                  <p className="text-gray-400 text-sm mt-1">Tambahkan alamat untuk mempercepat proses checkout</p>
                  <button
                    onClick={() => { setAddrForm({ ...emptyAddr, fullName: user.name }); setAddrModal({ mode: "add" }); }}
                    className="mt-4 text-sm text-blue-600 hover:underline"
                  >
                    + Tambah alamat pertama Anda
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myAddresses.map((addr) => {
                    const LabelIcon = addr.label === "Kantor" ? Building2 : addr.label === "Kost" ? Home : MapPin;
                    return (
                      <div key={addr.id} className={`bg-white border-2 rounded-2xl shadow-sm p-5 relative transition-all ${addr.isDefault ? "border-blue-500" : "border-gray-100 hover:border-gray-200"}`}>
                        {/* Default badge */}
                        {addr.isDefault && (
                          <span className="absolute top-3 right-3 flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                            <CheckCircle2 className="h-3 w-3" /> Utama
                          </span>
                        )}

                        {/* Label */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`p-1.5 rounded-lg ${addr.isDefault ? "bg-blue-100" : "bg-gray-100"}`}>
                            <LabelIcon className={`h-4 w-4 ${addr.isDefault ? "text-blue-600" : "text-gray-500"}`} />
                          </div>
                          <span className="font-semibold text-gray-900 text-sm">{addr.label}</span>
                        </div>

                        {/* Address details */}
                        <p className="font-medium text-gray-900 text-sm">{addr.fullName}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{addr.phone}</p>
                        <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                          {addr.address}, {addr.city}, {addr.province} {addr.postalCode}
                        </p>
                        {addr.notes && <p className="text-gray-400 text-xs mt-1 italic">Catatan: {addr.notes}</p>}

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                          {!addr.isDefault && (
                            <button
                              onClick={() => { setDefault(addr.id, user.id); toast.success(`"${addr.label}" dijadikan alamat utama`); }}
                              className="text-xs text-blue-600 hover:underline font-medium"
                            >
                              Jadikan Utama
                            </button>
                          )}
                          <div className="ml-auto flex gap-1.5">
                            <button
                              onClick={() => {
                                setAddrForm({ label: addr.label, fullName: addr.fullName, phone: addr.phone, address: addr.address, city: addr.city, province: addr.province, postalCode: addr.postalCode, notes: addr.notes || "", isDefault: addr.isDefault });
                                setAddrModal({ mode: "edit", id: addr.id });
                              }}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setAddrDeleteConfirm({ id: addr.id, label: addr.label })}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                {/* ── Profile card ── */}
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 flex flex-col sm:flex-row gap-6 items-start">
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                    {sellerData && <p className="text-xs text-gray-400 mt-1">{sellerData.location}</p>}
                    {sellerData?.bio && <p className="text-sm text-gray-600 mt-2 leading-relaxed">{sellerData.bio}</p>}
                  </div>
                  {sellerData && (
                    <div className="flex sm:flex-col gap-4 sm:gap-2 text-center sm:text-right flex-shrink-0">
                      <div><p className="text-xl font-bold text-blue-600">{sellerData.rating}★</p><p className="text-xs text-gray-400">Rating</p></div>
                      <div><p className="text-xl font-bold text-blue-600">{sellerData.responseRate}%</p><p className="text-xs text-gray-400">Respon</p></div>
                    </div>
                  )}
                </div>

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
          {/* ===== SELLER PRODUCTS TAB ===== */}
          {activeTab === "seller-products" && (() => {
            const filtered = sellerProducts.filter(p =>
              p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
              p.category.toLowerCase().includes(productSearch.toLowerCase())
            );
            return (
            <div className="space-y-4">
              {/* Header bar */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col sm:flex-row sm:items-center gap-3">
                <div>
                  <h2 className="font-bold text-gray-900">Manajemen Produk</h2>
                  <p className="text-sm text-gray-400 mt-0.5">{sellerProducts.length} produk terdaftar</p>
                </div>
                <div className="flex items-center gap-3 sm:ml-auto">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      placeholder="Cari produk..."
                      className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400 w-48"
                    />
                  </div>
                  {/* Add button */}
                  <button
                    onClick={() => { setProductForm(emptyForm); setProductModal({ mode: "add" }); }}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-sm shadow-blue-200"
                  >
                    <Plus className="h-4 w-4" /> Tambah Produk
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                {/* Table header */}
                <div className="hidden md:grid grid-cols-[3fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <span>Produk</span>
                  <span>Kategori</span>
                  <span>Harga</span>
                  <span>Stok</span>
                  <span>Status</span>
                  <span className="text-center">Aksi</span>
                </div>

                {filtered.length === 0 ? (
                  <div className="p-16 text-center">
                    <Package className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">
                      {productSearch ? "Tidak ada produk yang cocok" : "Belum ada produk"}
                    </p>
                    {!productSearch && (
                      <button
                        onClick={() => { setProductForm(emptyForm); setProductModal({ mode: "add" }); }}
                        className="mt-4 text-sm text-blue-600 hover:underline"
                      >
                        + Tambah produk pertama Anda
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {filtered.map((product) => {
                      const stock = getStock(product.id);
                      const stockColor = stock === 0 ? "bg-red-100 text-red-700" : stock <= 5 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700";
                      const statusColor = product.inStock && stock > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
                      return (
                        <div key={product.id} className="grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr_1fr_1fr_auto] gap-4 items-center px-5 py-4 hover:bg-gray-50/60 transition-colors group">
                          {/* Product info */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative flex-shrink-0">
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-14 h-14 object-cover rounded-xl border border-gray-100"
                                onError={e => { (e.target as HTMLImageElement).src = "https://placehold.co/56x56?text=IMG"; }}
                              />
                              {stock === 0 && (
                                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                                  <span className="text-white text-[9px] font-bold">HABIS</span>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm text-gray-900 truncate">{product.name}</p>
                              <p className="text-xs text-gray-400 truncate mt-0.5 max-w-[200px]">{product.description}</p>
                              {product.rating && (
                                <div className="flex items-center gap-1 mt-1">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                  <span className="text-xs text-gray-500">{product.rating} ({product.reviewCount || 0})</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Category */}
                          <div className="flex items-center md:block">
                            <span className="md:hidden text-xs text-gray-400 w-20">Kategori:</span>
                            <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">{product.category}</span>
                          </div>

                          {/* Price */}
                          <div className="flex items-center md:block">
                            <span className="md:hidden text-xs text-gray-400 w-20">Harga:</span>
                            <span className="text-sm font-bold text-gray-900">{formatRp(product.price)}</span>
                          </div>

                          {/* Stock */}
                          <div className="flex items-center md:block">
                            <span className="md:hidden text-xs text-gray-400 w-20">Stok:</span>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${stockColor}`}>{stock} unit</span>
                          </div>

                          {/* Status */}
                          <div className="flex items-center md:block">
                            <span className="md:hidden text-xs text-gray-400 w-20">Status:</span>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${statusColor}`}>
                              {product.inStock && stock > 0 ? "Aktif" : "Nonaktif"}
                            </span>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1.5 md:justify-center">
                            <button
                              onClick={() => {
                                setProductForm({
                                  name: product.name,
                                  description: product.description,
                                  price: String(product.price),
                                  category: product.category,
                                  image: product.image,
                                  stock: String(stock),
                                });
                                setProductModal({ mode: "edit", productId: product.id });
                              }}
                              className="p-2 rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit produk"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ id: product.id, name: product.name })}
                              className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                              title="Hapus produk"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Footer summary */}
                {filtered.length > 0 && (
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                    <span>Menampilkan {filtered.length} dari {sellerProducts.length} produk</span>
                    <span>
                      {sellerProducts.filter(p => getStock(p.id) === 0).length} produk stok habis ·{" "}
                      {sellerProducts.filter(p => getStock(p.id) > 0 && getStock(p.id) <= 5).length} menipis
                    </span>
                  </div>
                )}
              </div>
            </div>
            );
          })()}

          {/* ===== SELLER RESTOCK TAB (instant, no approval) ===== */}
          {activeTab === "seller-restock" && (
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
              <div className="p-5 border-b border-gray-50">
                <h2 className="font-bold text-gray-900 mb-0.5">Kelola Stok Produk</h2>
                <p className="text-sm text-gray-400">Tambah stok langsung — berlaku seketika tanpa perlu persetujuan.</p>
              </div>

              {sellerProducts.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                  <RefreshCw className="h-10 w-10 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">Tidak ada produk untuk di-restock</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {sellerProducts.map((product) => {
                    const current = getStock(product.id);
                    const qty = restockQty[product.id] ?? 10;
                    return (
                      <div key={product.id} className="flex items-center gap-4 p-4 hover:bg-gray-50/60 transition-colors">
                        <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-cover flex-shrink-0 border border-gray-100" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{product.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              current === 0 ? "bg-red-100 text-red-600"
                              : current <= 5 ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                            }`}>
                              Stok: {current}
                            </span>
                            {current === 0 && <span className="text-xs text-red-500 font-medium">Habis</span>}
                            {current > 0 && current <= 5 && <span className="text-xs text-yellow-600">⚠ Menipis</span>}
                          </div>
                        </div>

                        {/* Quantity picker */}
                        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 flex-shrink-0">
                          <button
                            onClick={() => setRestockQty(prev => ({ ...prev, [product.id]: Math.max(1, (prev[product.id] ?? 10) - 1) }))}
                            className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-blue-50 font-bold"
                          >−</button>
                          <span className="w-9 text-center text-sm font-semibold text-gray-800">{qty}</span>
                          <button
                            onClick={() => setRestockQty(prev => ({ ...prev, [product.id]: (prev[product.id] ?? 10) + 1 }))}
                            className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-blue-50 font-bold"
                          >+</button>
                        </div>

                        {/* Instant add button */}
                        <button
                          onClick={() => {
                            addStock(product.id, qty);
                            toast.success(`Stok bertambah +${qty}`, { description: product.name });
                          }}
                          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2 rounded-xl transition-colors font-medium flex-shrink-0"
                        >
                          <Plus className="h-3.5 w-3.5" /> Tambah Stok
                        </button>
                      </div>
                    );
                  })}
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

      {/* ===== ADD / EDIT ADDRESS MODAL ===== */}
      {addrModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">{addrModal.mode === "add" ? "Tambah Alamat Baru" : "Edit Alamat"}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Alamat akan tersimpan untuk digunakan saat checkout</p>
              </div>
              <button onClick={() => setAddrModal(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><X className="h-5 w-5" /></button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Label Alamat</label>
                <div className="flex gap-2">
                  {["Rumah", "Kantor", "Kost", "Lainnya"].map(l => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setAddrForm(f => ({ ...f, label: l }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium border-2 transition-all ${addrForm.label === l ? "border-blue-600 bg-blue-600 text-white" : "border-gray-200 text-gray-600 hover:border-blue-300"}`}
                    >
                      {l === "Rumah" && <Home className="h-3.5 w-3.5" />}
                      {l === "Kantor" && <Building2 className="h-3.5 w-3.5" />}
                      {l === "Kost" && <Home className="h-3.5 w-3.5" />}
                      {l === "Lainnya" && <MapPin className="h-3.5 w-3.5" />}
                      {l}
                    </button>
                  ))}
                  {!["Rumah", "Kantor", "Kost", "Lainnya"].includes(addrForm.label) && (
                    <input value={addrForm.label} onChange={e => setAddrForm(f => ({ ...f, label: e.target.value }))} placeholder="Label kustom..." className="border border-gray-200 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:border-blue-400 bg-gray-50" />
                  )}
                </div>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Penerima *</label>
                  <input value={addrForm.fullName} onChange={e => setAddrForm(f => ({ ...f, fullName: e.target.value }))} placeholder="Nama lengkap" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor Telepon *</label>
                  <input value={addrForm.phone} onChange={e => setAddrForm(f => ({ ...f, phone: e.target.value }))} placeholder="08xxxxxxxxxx" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white" />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat Lengkap *</label>
                <textarea value={addrForm.address} onChange={e => setAddrForm(f => ({ ...f, address: e.target.value }))} placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan" rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white resize-none" />
              </div>

              {/* City, Province, Postal */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kota/Kabupaten *</label>
                  <input value={addrForm.city} onChange={e => setAddrForm(f => ({ ...f, city: e.target.value }))} placeholder="Purbalingga" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Provinsi *</label>
                  <input value={addrForm.province} onChange={e => setAddrForm(f => ({ ...f, province: e.target.value }))} placeholder="Jawa Tengah" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kode Pos *</label>
                  <input value={addrForm.postalCode} onChange={e => setAddrForm(f => ({ ...f, postalCode: e.target.value }))} placeholder="53316" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan Kurir</label>
                  <input value={addrForm.notes} onChange={e => setAddrForm(f => ({ ...f, notes: e.target.value }))} placeholder="Patokan, warna pintu..." className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white" />
                </div>
              </div>

              {/* Default toggle */}
              <label className="flex items-center gap-3 cursor-pointer p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <input type="checkbox" checked={addrForm.isDefault} onChange={e => setAddrForm(f => ({ ...f, isDefault: e.target.checked }))} className="w-4 h-4 accent-blue-600 rounded" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Jadikan alamat utama</p>
                  <p className="text-xs text-blue-600">Akan otomatis dipilih saat checkout</p>
                </div>
              </label>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setAddrModal(null)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 font-medium">Batal</button>
              <button
                onClick={() => {
                  if (!addrForm.fullName || !addrForm.phone || !addrForm.address || !addrForm.city || !addrForm.province || !addrForm.postalCode) {
                    toast.error("Lengkapi semua field wajib"); return;
                  }
                  if (addrModal.mode === "add") {
                    addAddress(user.id, { label: addrForm.label, fullName: addrForm.fullName, phone: addrForm.phone, address: addrForm.address, city: addrForm.city, province: addrForm.province, postalCode: addrForm.postalCode, notes: addrForm.notes, isDefault: addrForm.isDefault });
                    toast.success("Alamat berhasil ditambahkan!");
                  } else if (addrModal.id) {
                    updateAddress(addrModal.id, { label: addrForm.label, fullName: addrForm.fullName, phone: addrForm.phone, address: addrForm.address, city: addrForm.city, province: addrForm.province, postalCode: addrForm.postalCode, notes: addrForm.notes });
                    if (addrForm.isDefault) setDefault(addrModal.id, user.id);
                    toast.success("Alamat berhasil diperbarui!");
                  }
                  setAddrModal(null);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                {addrModal.mode === "add" ? "Simpan Alamat" : "Perbarui Alamat"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address Delete Confirm */}
      {addrDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Hapus Alamat?</h3>
            <p className="text-sm text-gray-500 mb-5">Alamat <span className="font-semibold text-gray-700">"{addrDeleteConfirm.label}"</span> akan dihapus permanen.</p>
            <div className="flex gap-3">
              <button onClick={() => setAddrDeleteConfirm(null)} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 font-medium">Batal</button>
              <button onClick={() => { deleteAddress(addrDeleteConfirm.id); toast.success("Alamat dihapus"); setAddrDeleteConfirm(null); }} className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== ADD / EDIT PRODUCT MODAL ===== */}
      {productModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">
                  {productModal.mode === "add" ? "Tambah Produk Baru" : "Edit Produk"}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {productModal.mode === "add" ? "Isi detail produk yang ingin dijual" : "Perbarui informasi produk"}
                </p>
              </div>
              <button onClick={() => setProductModal(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* Image preview */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-gray-400" /> URL Gambar Produk
                </label>
                <input
                  value={productForm.image}
                  onChange={e => setProductForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="https://..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white"
                />
                {productForm.image && (
                  <img
                    src={productForm.image}
                    alt="preview"
                    className="mt-2 w-full h-32 object-cover rounded-xl border border-gray-100"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                )}
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Tag className="h-4 w-4 text-gray-400" /> Nama Produk
                </label>
                <input
                  value={productForm.name}
                  onChange={e => setProductForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Nama produk..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
                <textarea
                  value={productForm.description}
                  onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Deskripsi singkat produk..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white resize-none"
                />
              </div>

              {/* Category + Price row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-gray-400" /> Kategori
                  </label>
                  <select
                    value={productForm.category}
                    onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga (Rp)</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={e => setProductForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="350000"
                    min="0"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Stok Awal</label>
                <input
                  type="number"
                  value={productForm.stock}
                  onChange={e => setProductForm(f => ({ ...f, stock: e.target.value }))}
                  placeholder="10"
                  min="0"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setProductModal(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 font-medium"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (!productForm.name.trim() || !productForm.price) {
                    toast.error("Nama dan harga wajib diisi");
                    return;
                  }
                  const price = parseInt(productForm.price) || 0;
                  const stock = parseInt(productForm.stock) || 0;

                  if (productModal.mode === "add") {
                    addProduct({
                      name: productForm.name,
                      description: productForm.description,
                      price,
                      category: productForm.category,
                      image: productForm.image || "https://placehold.co/400x400?text=Produk",
                      inStock: stock > 0,
                      stock,
                      sellerId: user.id,
                      sellerName: user.name,
                    });
                    toast.success("Produk berhasil ditambahkan!");
                  } else if (productModal.productId) {
                    updateProduct(productModal.productId, {
                      name: productForm.name,
                      description: productForm.description,
                      price,
                      category: productForm.category,
                      image: productForm.image,
                      inStock: stock > 0,
                      stock,
                    });
                    toast.success("Produk berhasil diperbarui!");
                  }
                  setProductModal(null);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                {productModal.mode === "add" ? "Tambah Produk" : "Simpan Perubahan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DELETE CONFIRMATION ===== */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 text-center mb-1">Hapus Produk?</h3>
            <p className="text-sm text-gray-500 text-center mb-5">
              <span className="font-medium text-gray-700">"{deleteConfirm.name}"</span> akan dihapus secara permanen dan tidak dapat dikembalikan.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 font-medium"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  deleteProduct(deleteConfirm.id);
                  toast.success(`"${deleteConfirm.name}" berhasil dihapus`);
                  setDeleteConfirm(null);
                }}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

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
                  <option value="none" disabled>-- Pilih Produk --</option>
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
