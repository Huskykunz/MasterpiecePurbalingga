import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useOrders } from "../context/OrderContext";
import { useReturn } from "../context/ReturnContext";
import { useReviews } from "../context/ReviewContext";
import { Button } from "./ui/button";
import {
  Package, Eye, MessageCircle, Clock, Cog, Truck, CheckCircle2,
  XCircle, Star, Receipt, AlertTriangle, RotateCcw, CreditCard, X,
} from "lucide-react";
import { Order } from "../types";
import { ReviewModal } from "./ReviewModal";
import { toast } from "sonner";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

type TabKey = "all" | "unpaid" | "processing" | "shipped" | "delivered" | "cancelled" | "return";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "all",        label: "Semua",         icon: Package },
  { key: "unpaid",     label: "Belum Dibayar", icon: CreditCard },
  { key: "processing", label: "Dikemas",        icon: Cog },
  { key: "shipped",    label: "Dikirim",        icon: Truck },
  { key: "delivered",  label: "Selesai",        icon: CheckCircle2 },
  { key: "cancelled",  label: "Dibatalkan",     icon: XCircle },
  { key: "return",     label: "Pengembalian",   icon: RotateCcw },
];

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  pending:    { label: "Menunggu",   cls: "bg-yellow-100 text-yellow-800" },
  processing: { label: "Dikemas",    cls: "bg-blue-100 text-blue-800" },
  shipped:    { label: "Dikirim",    cls: "bg-purple-100 text-purple-800" },
  delivered:  { label: "Selesai",    cls: "bg-green-100 text-green-800" },
  cancelled:  { label: "Dibatalkan", cls: "bg-red-100 text-red-800" },
};

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Bayar di Tempat (COD)", transfer: "Transfer Bank", ewallet: "E-Wallet",
};

const RETURN_STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700", accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",      completed: "bg-gray-100 text-gray-600",
};
const RETURN_STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu Respons", accepted: "Diterima", rejected: "Ditolak", completed: "Selesai",
};
const RETURN_REASON_LABEL: Record<string, string> = {
  defective: "Produk Cacat", wrong_item: "Item Salah",
  not_as_described: "Tidak Sesuai Deskripsi", changed_mind: "Berubah Pikiran", other: "Lainnya",
};

interface Props {
  userId: string;
  userName: string;
}

export function OrdersTab({ userId, userName }: Props) {
  const { getUserOrders, completeOrder, canComplete, cancelOrder, canCancel, getShippingMessage } = useOrders();
  const { getReturnsByCustomer, requestReturn } = useReturn();
  const { getProductReviews } = useReviews();

  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [reviewTarget, setReviewTarget] = useState<{ productId: string; productName: string } | null>(null);
  const [returnModal, setReturnModal] = useState<{
    orderId: string; item: Order["items"][0]; sellerId: string; sellerName: string;
  } | null>(null);
  const [returnReason, setReturnReason] = useState<
    "defective" | "wrong_item" | "not_as_described" | "changed_mind" | "other"
  >("defective");
  const [returnDesc, setReturnDesc] = useState("");
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null);

  // Re-evaluate canComplete / canCancel every second
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const orders = getUserOrders(userId);
  const myReturns = getReturnsByCustomer(userId);

  const filterOrders = (tab: TabKey): Order[] => {
    switch (tab) {
      case "unpaid":     return orders.filter(o => o.status === "pending" && o.paymentMethod !== "cod");
      case "processing": return orders.filter(o => o.status === "processing");
      case "shipped":    return orders.filter(o => o.status === "shipped");
      case "delivered":  return orders.filter(o => o.status === "delivered");
      case "cancelled":  return orders.filter(o => o.status === "cancelled");
      default:           return orders;
    }
  };

  const tabCount = (tab: TabKey) => {
    if (tab === "return") return myReturns.length || undefined;
    if (tab === "all") return undefined;
    const n = filterOrders(tab).length;
    return n || undefined;
  };

  const handleCompleteOrder = (orderId: string) => {
    completeOrder(orderId);
    toast.success("Pesanan ditandai selesai!", { description: "Terima kasih telah berbelanja!" });
  };

  const handleCancelOrder = (orderId: string) => {
    cancelOrder(orderId);
    setCancelConfirm(null);
    toast.success("Pesanan berhasil dibatalkan");
  };

  const handleSubmitReturn = () => {
    if (!returnModal || !returnDesc.trim()) { toast.error("Mohon isi deskripsi masalah"); return; }
    requestReturn({
      customerId: userId, customerName: userName,
      orderId: returnModal.orderId,
      productId: returnModal.item.id, productName: returnModal.item.name,
      sellerId: returnModal.sellerId, sellerName: returnModal.sellerName,
      reason: returnReason, description: returnDesc,
      refundAmount: returnModal.item.price * returnModal.item.quantity,
    });
    toast.success("Pengajuan pengembalian berhasil dikirim");
    setReturnModal(null);
    setReturnDesc("");
    setActiveTab("return");
  };

  // ── Order card ──────────────────────────────────────────────────────────────
  const OrderCard = ({ order }: { order: Order }) => {
    const shippingMsg = getShippingMessage(order.id);
    const canDone = canComplete(order.id);
    const canBeCancelled = canCancel(order.id);
    const isNonCodPending = order.status === "pending" && order.paymentMethod !== "cod";
    const hasReturn = myReturns.some(r => r.orderId === order.id);

    const msLeft = 10 * 60_000 - (Date.now() - new Date(order.createdAt).getTime());
    const secLeft = Math.max(0, Math.ceil(msLeft / 1000));
    const minLeft = Math.floor(secLeft / 60);
    const secRem = secLeft % 60;

    return (
      <div className={`bg-white border-2 rounded-2xl shadow-sm overflow-hidden ${
        order.status === "delivered" ? "border-green-100"
        : order.status === "cancelled" ? "border-red-100"
        : "border-gray-100"
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-gray-50/60 border-b border-gray-100">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-mono text-gray-400 truncate">{order.id}</span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-400 flex-shrink-0">{fmtDate(order.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {isNonCodPending && (
              <span className="text-xs bg-yellow-100 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <CreditCard className="h-3 w-3" /> Belum Dibayar
              </span>
            )}
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${STATUS_BADGE[order.status]?.cls}`}>
              {STATUS_BADGE[order.status]?.label}
            </span>
          </div>
        </div>

        {/* Belum Dibayar banner */}
        {isNonCodPending && (
          <div className="mx-5 mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
            <CreditCard className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Menunggu Pembayaran</p>
              <p className="text-xs text-amber-600 mt-0.5">Metode: {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</p>
              <p className="text-xs text-amber-600">Total: <span className="font-bold">{fmt(order.total)}</span></p>
            </div>
          </div>
        )}

        {/* Shipping banner */}
        {order.status === "shipped" && shippingMsg && (
          <div className="mx-5 mt-4 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <Truck className="h-5 w-5 text-purple-500 flex-shrink-0 animate-pulse" />
            <div>
              <p className="text-sm font-semibold text-purple-800">Barang Dalam Pengiriman</p>
              <p className="text-xs text-purple-600 mt-0.5">{shippingMsg}</p>
            </div>
          </div>
        )}

        {/* Processing banner */}
        {order.status === "processing" && (
          <div className="mx-5 mt-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <Cog className="h-5 w-5 text-blue-500 flex-shrink-0" style={{ animation: "spin 3s linear infinite" }} />
            <p className="text-sm font-semibold text-blue-800">Penjual sedang mengemas pesanan Anda</p>
          </div>
        )}

        {/* Items */}
        <div className="px-5 py-4 space-y-3">
          {order.items.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl border border-gray-100 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{item.quantity} × {fmt(item.price)}</p>
                {item.sellerName && <p className="text-xs text-gray-400">Toko: {item.sellerName}</p>}
              </div>
              <p className="text-sm font-bold text-gray-900 flex-shrink-0">{fmt(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="px-5 pb-4 flex items-center justify-between border-t border-gray-50 pt-3">
          <p className="text-xs text-gray-400">{order.items.length} produk</p>
          <p className="text-sm">Total: <span className="font-bold text-blue-600 text-base">{fmt(order.total)}</span></p>
        </div>

        {/* Actions */}
        <div className="px-4 pb-4 flex flex-wrap gap-2 justify-end">
          {canBeCancelled && (
            <button onClick={() => setCancelConfirm(order.id)}
              className="flex items-center gap-1.5 border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium px-3 py-1.5 rounded-xl transition-colors">
              <X className="h-3.5 w-3.5" /> Batalkan ({minLeft}:{String(secRem).padStart(2, "0")})
            </button>
          )}

          {order.status === "shipped" && (
            canDone ? (
              <button onClick={() => handleCompleteOrder(order.id)}
                className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold px-4 py-1.5 rounded-xl transition-colors">
                <CheckCircle2 className="h-3.5 w-3.5" /> Selesaikan Pesanan
              </button>
            ) : (
              <span className="text-xs text-gray-400 border border-dashed border-gray-200 rounded-xl px-3 py-1.5 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Konfirmasi tersedia setelah paket tiba
              </span>
            )
          )}

          {order.status === "delivered" && (
            <>
              {order.items.map(item => {
                const reviewed = getProductReviews(item.id).some(r => r.userId === userId);
                return (
                  <button key={item.id}
                    onClick={() => setReviewTarget({ productId: item.id, productName: item.name })}
                    className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl border transition-colors ${
                      reviewed ? "border-green-200 text-green-600 bg-green-50" : "border-amber-200 text-amber-600 hover:bg-amber-50"
                    }`}>
                    <Star className={`h-3.5 w-3.5 ${reviewed ? "fill-green-400" : ""}`} />
                    {reviewed ? "Diulas" : "Beri Ulasan"}
                  </button>
                );
              })}
              {!hasReturn ? (
                <button
                  onClick={() => {
                    const item = order.items[0];
                    setReturnModal({ orderId: order.id, item, sellerId: (item as any).sellerId || "", sellerName: item.sellerName || "" });
                  }}
                  className="flex items-center gap-1.5 border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-medium px-3 py-1.5 rounded-xl transition-colors">
                  <RotateCcw className="h-3.5 w-3.5" /> Ajukan Retur
                </button>
              ) : (
                <span className="text-xs text-blue-600 border border-blue-200 bg-blue-50 px-3 py-1.5 rounded-xl">
                  Retur Diajukan
                </span>
              )}
            </>
          )}

          <Link to={`/invoice/${order.id}`}>
            <button className="flex items-center gap-1.5 border border-blue-200 text-blue-500 hover:bg-blue-50 text-xs font-medium px-3 py-1.5 rounded-xl transition-colors">
              <Receipt className="h-3.5 w-3.5" /> Invoice
            </button>
          </Link>
          <Link to={`/order-confirmation/${order.id}`}>
            <button className="flex items-center gap-1.5 border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-medium px-3 py-1.5 rounded-xl transition-colors">
              <Eye className="h-3.5 w-3.5" /> Detail
            </button>
          </Link>
          <Link to={`/complaint?order=${order.id}`}>
            <button className="flex items-center gap-1.5 border border-gray-200 text-gray-500 hover:bg-gray-50 text-xs font-medium px-3 py-1.5 rounded-xl transition-colors">
              <MessageCircle className="h-3.5 w-3.5" /> Komplain
            </button>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Status tab bar */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden mb-4">
        <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-100">
          {TABS.map(({ key, label, icon: Icon }) => {
            const count = tabCount(key);
            return (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  activeTab === key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-800"
                }`}>
                <Icon className="h-3.5 w-3.5" />
                {label}
                {count !== undefined && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center ${
                    activeTab === key ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"
                  }`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {activeTab !== "return" ? (
          (() => {
            const list = filterOrders(activeTab);
            if (list.length === 0) return (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
                <Package className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400 font-medium text-sm">Tidak ada pesanan di sini</p>
                <Link to="/shop" className="mt-2 block text-sm text-blue-600 hover:underline">Mulai belanja</Link>
              </div>
            );
            return list.map(order => <OrderCard key={order.id} order={order} />);
          })()
        ) : (
          myReturns.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
              <RotateCcw className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium text-sm">Belum ada pengajuan pengembalian</p>
            </div>
          ) : (
            myReturns.map(ret => (
              <div key={ret.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <p className="text-xs text-gray-400 font-mono truncate">{ret.orderId}</p>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold flex-shrink-0 ml-2 ${RETURN_STATUS_COLOR[ret.status]}`}>
                    {RETURN_STATUS_LABEL[ret.status]}
                  </span>
                </div>
                <div className="px-5 py-4">
                  <p className="font-semibold text-gray-900 text-sm">{ret.productName}</p>
                  <p className="text-xs text-gray-400 mt-1">Alasan: {RETURN_REASON_LABEL[ret.reason] || ret.reason}</p>
                  <p className="text-xs text-gray-500 mt-1">{ret.description}</p>
                  {ret.sellerNote && (
                    <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                      <p className="text-xs text-blue-700"><span className="font-semibold">Catatan penjual:</span> {ret.sellerNote}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-gray-400">{fmtDate(ret.createdAt)}</p>
                    <p className="text-sm font-bold text-blue-600">Refund: {fmt(ret.refundAmount)}</p>
                  </div>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {/* Cancel confirm */}
      {cancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Batalkan Pesanan?</h3>
            <p className="text-sm text-gray-500 mb-5">Pesanan <span className="font-semibold text-gray-700">{cancelConfirm}</span> akan dibatalkan permanen.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setCancelConfirm(null)}>Tidak</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={() => handleCancelOrder(cancelConfirm)}>Ya, Batalkan</Button>
            </div>
          </div>
        </div>
      )}

      {/* Return modal */}
      {returnModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">Ajukan Pengembalian</h3>
              <button onClick={() => setReturnModal(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Produk</p>
                <p className="text-sm font-semibold text-gray-900">{returnModal.item.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Alasan Pengembalian</label>
                <select value={returnReason} onChange={e => setReturnReason(e.target.value as any)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-blue-400">
                  <option value="defective">Produk Cacat / Rusak</option>
                  <option value="wrong_item">Produk Tidak Sesuai Pesanan</option>
                  <option value="not_as_described">Tidak Sesuai Deskripsi</option>
                  <option value="changed_mind">Berubah Pikiran</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi Masalah</label>
                <textarea value={returnDesc} onChange={e => setReturnDesc(e.target.value)} rows={3}
                  placeholder="Jelaskan masalah secara detail..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:outline-none focus:border-blue-400 resize-none" />
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-xs text-blue-700">Estimasi refund: <span className="font-bold">{fmt(returnModal.item.price * returnModal.item.quantity)}</span></p>
              </div>
            </div>
            <div className="px-6 pb-5 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setReturnModal(null)}>Batal</Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-500" onClick={handleSubmitReturn}>Kirim Pengajuan</Button>
            </div>
          </div>
        </div>
      )}

      {/* Review modal */}
      {reviewTarget && (
        <ReviewModal productId={reviewTarget.productId} productName={reviewTarget.productName} onClose={() => setReviewTarget(null)} />
      )}
    </>
  );
}
