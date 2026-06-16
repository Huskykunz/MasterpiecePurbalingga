import { useParams, useNavigate } from "react-router";
import { useOrders } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import { sellers } from "../data/sellers";
import { ArrowLeft, Download, CheckCircle, Store, User, MapPin, Phone, Mail, Calendar, Hash, CreditCard, Package } from "lucide-react";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const SERVICE_FEE_RATE = 0.01; // 1% service fee

export default function Invoice() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrder } = useOrders();
  const { user } = useAuth();

  const order = getOrder(orderId || "");

  if (!order || order.userId !== user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white border border-gray-100 rounded-2xl p-10 shadow-sm">
          <p className="text-gray-500 mb-4">Invoice tidak ditemukan</p>
          <button onClick={() => navigate("/orders")} className="text-blue-600 text-sm hover:underline">
            Kembali ke Pesanan
          </button>
        </div>
      </div>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const itemsSubtotal = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingCost = itemsSubtotal >= 100000 ? 0 : 15000;
  const serviceFee = Math.round(itemsSubtotal * SERVICE_FEE_RATE);
  const grandTotal = itemsSubtotal + shippingCost + serviceFee;

  const isPaid = order.status === "delivered" || order.status === "shipped" || order.status === "processing";

  const invoiceNumber = `INV-${order.id.replace("ORD-", "")}`;
  const txDate = new Date(order.createdAt);
  const dateStr = txDate.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
  const timeStr = txDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  // Group items by seller for display
  const sellerIds = [...new Set(order.items.map(i => (i as any).sellerId).filter(Boolean))];
  const primarySellerId = sellerIds[0] || order.items[0]?.sellerId;
  const sellerData = sellers.find(s => s.id === primarySellerId);
  const sellerName = sellerData?.name || order.items[0]?.sellerName || "Masterpiece Purbalingga";
  const sellerLocation = sellerData?.location || "Purbalingga, Jawa Tengah";

  const paymentLabel: Record<string, string> = {
    cod: "Bayar di Tempat (COD)",
    transfer: "Transfer Bank",
    ewallet: "E-Wallet",
  };

  // ── Print / PDF ────────────────────────────────────────────────────────────
  const handleDownload = () => {
    const style = document.createElement("style");
    style.id = "invoice-print-style";
    style.innerHTML = `
      @media print {
        body * { visibility: hidden !important; }
        #invoice-printable, #invoice-printable * { visibility: visible !important; }
        #invoice-printable { position: fixed; top: 0; left: 0; width: 100%; }
        .no-print { display: none !important; }
        @page { margin: 0.5in; size: A4; }
      }
    `;
    document.head.appendChild(style);
    window.print();
    document.head.removeChild(style);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Top action bar — hidden when printing */}
      <div className="no-print max-w-4xl mx-auto flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-800 text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-blue-200"
        >
          <Download className="h-4 w-4" /> Download PDF
        </button>
      </div>

      {/* ── Invoice Paper ─────────────────────────────────────────────────── */}
      <div
        id="invoice-printable"
        className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden relative"
      >
        {/* LUNAS watermark */}
        {isPaid && (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10"
            aria-hidden="true"
          >
            <span
              style={{ transform: "rotate(-35deg)", fontSize: "7rem", lineHeight: 1 }}
              className="font-black text-green-500/10 tracking-widest uppercase"
            >
              LUNAS
            </span>
          </div>
        )}

        {/* ── Header band ─────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 text-white px-8 py-7 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-lg leading-none">Masterpiece Purbalingga</p>
                <p className="text-blue-200 text-xs mt-0.5">marketplace.masterpiecepbg.com</p>
              </div>
            </div>
            <p className="text-blue-100 text-sm">Platform Knalpot Motor Handcrafted</p>
            <p className="text-blue-200 text-xs mt-0.5">Purbalingga, Jawa Tengah, Indonesia</p>
          </div>
          <div className="text-right">
            <p className="text-blue-200 text-xs uppercase tracking-widest mb-1">INVOICE</p>
            <p className="text-2xl font-bold font-mono">{invoiceNumber}</p>
            {/* Status pill */}
            <div className="mt-3 flex justify-end">
              {isPaid ? (
                <span className="inline-flex items-center gap-1.5 bg-green-400/20 border border-green-400/40 text-green-200 text-xs font-bold px-3 py-1.5 rounded-full">
                  <CheckCircle className="h-3.5 w-3.5" /> LUNAS
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-yellow-400/20 border border-yellow-400/40 text-yellow-200 text-xs font-bold px-3 py-1.5 rounded-full">
                  MENUNGGU
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Meta row ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-0 border-b border-gray-100">
          {[
            { icon: Hash, label: "Nomor Pesanan", value: order.id },
            { icon: Calendar, label: "Tanggal Transaksi", value: `${dateStr}, ${timeStr}` },
            { icon: CreditCard, label: "Metode Pembayaran", value: paymentLabel[order.paymentMethod] || order.paymentMethod },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="px-6 py-4 border-r border-gray-100 last:border-r-0">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className="h-3.5 w-3.5 text-gray-400" />
                <p className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </div>

        {/* ── Seller & Buyer ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-0 border-b border-gray-100">
          {/* Seller */}
          <div className="px-8 py-6 border-r border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                <Store className="h-4 w-4 text-blue-600" />
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Penjual</p>
            </div>
            <p className="font-bold text-gray-900">{sellerName}</p>
            <div className="mt-2 space-y-1.5 text-sm text-gray-600">
              <div className="flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <span>{sellerLocation}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span>info@masterpiecepbg.com</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span>+62 812-3456-7890</span>
              </div>
            </div>
          </div>

          {/* Buyer */}
          <div className="px-8 py-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Pembeli</p>
            </div>
            <p className="font-bold text-gray-900">{order.shippingAddress.fullName}</p>
            <div className="mt-2 space-y-1.5 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                <span>{order.shippingAddress.phone}</span>
              </div>
              <div className="flex items-start gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                <span>
                  {order.shippingAddress.address}, {order.shippingAddress.city},{" "}
                  {order.shippingAddress.province} {order.shippingAddress.postalCode}
                </span>
              </div>
              {order.shippingAddress.notes && (
                <p className="text-xs text-gray-400 italic">Catatan: {order.shippingAddress.notes}</p>
              )}
            </div>
          </div>
        </div>

        {/* ── Product table ────────────────────────────────────────────────── */}
        <div className="px-8 py-6">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-4 w-4 text-gray-400" />
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Rincian Produk</p>
          </div>

          {/* Table header */}
          <div className="grid grid-cols-[2fr_1fr_80px_1fr] gap-4 bg-gray-50 border border-gray-100 rounded-xl px-5 py-3 mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Produk</p>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Harga Satuan</p>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-center">Qty</p>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Subtotal</p>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50 border border-gray-100 rounded-xl overflow-hidden">
            {order.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-[2fr_1fr_80px_1fr] gap-4 px-5 py-4 items-center hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-11 h-11 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.category}</p>
                    {item.sellerName && <p className="text-xs text-gray-400">Penjual: {item.sellerName}</p>}
                  </div>
                </div>
                <p className="text-sm text-gray-700 text-right">{fmt(item.price)}</p>
                <p className="text-sm text-gray-700 text-center font-semibold">{item.quantity}</p>
                <p className="text-sm font-bold text-gray-900 text-right">{fmt(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Cost breakdown ───────────────────────────────────────────────── */}
        <div className="px-8 pb-8">
          <div className="max-w-xs ml-auto space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Total Harga ({order.items.reduce((s, i) => s + i.quantity, 0)} item)</span>
              <span className="font-medium text-gray-900">{fmt(itemsSubtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Ongkos Kirim</span>
              <span className={`font-medium ${shippingCost === 0 ? "text-green-600" : "text-gray-900"}`}>
                {shippingCost === 0 ? "Gratis" : fmt(shippingCost)}
              </span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span className="flex items-center gap-1">
                Biaya Layanan
                <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono">1%</span>
              </span>
              <span className="font-medium text-gray-900">{fmt(serviceFee)}</span>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-1" />

            {/* Grand total */}
            <div className="flex justify-between items-center py-1">
              <span className="font-bold text-gray-900">Total Bayar</span>
              <span className="text-xl font-black text-blue-700">{fmt(grandTotal)}</span>
            </div>

            {/* Paid badge */}
            {isPaid && (
              <div className="flex items-center justify-end gap-2 mt-3 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <div className="text-right">
                  <p className="text-xs font-bold text-green-700">PEMBAYARAN DITERIMA</p>
                  <p className="text-xs text-green-600">{dateStr}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="bg-gray-50 border-t border-gray-100 px-8 py-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">Invoice ini diterbitkan secara otomatis oleh sistem.</p>
            <p className="text-xs text-gray-400 mt-0.5">Dicetak pada: {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-gray-700">Masterpiece Purbalingga</p>
            <p className="text-xs text-gray-400">masterpiecepbg.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
