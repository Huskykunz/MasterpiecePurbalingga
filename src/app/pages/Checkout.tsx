import { useState, useCallback, memo } from "react";
import { useNavigate, Navigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
import { useAddress } from "../context/AddressContext";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { toast } from "sonner";
import {
  ShoppingBag, MapPin, CreditCard, ArrowLeft, Package, Zap,
  CheckCircle2, Plus, Home, Building2, ChevronDown, ChevronUp,
  Ticket, X, Check, AlertCircle, Percent,
} from "lucide-react";
import { ShippingAddress, CartItem } from "../types";
import { useCoupon, Coupon } from "../context/CouponContext";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

// ── Indonesian provinces ────────────────────────────────────────────────────
const PROVINCES = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau",
  "Jambi", "Sumatera Selatan", "Kepulauan Bangka Belitung", "Bengkulu",
  "Lampung", "DKI Jakarta", "Jawa Barat", "Banten", "Jawa Tengah",
  "DI Yogyakarta", "Jawa Timur", "Bali", "Nusa Tenggara Barat",
  "Nusa Tenggara Timur", "Kalimantan Barat", "Kalimantan Tengah",
  "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara",
  "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat",
  "Sulawesi Selatan", "Sulawesi Tenggara", "Maluku", "Maluku Utara",
  "Papua", "Papua Barat", "Papua Selatan", "Papua Tengah",
  "Papua Pegunungan", "Papua Barat Daya",
];

// ── Service fee ─────────────────────────────────────────────────────────────
function calcServiceFee(subtotal: number): { fee: number; rate: number } {
  const rate = subtotal < 1_000_000 ? 10 : 5;
  return { fee: Math.round(subtotal * rate / 100), rate };
}

// ── Validation helpers ──────────────────────────────────────────────────────
type FieldKey = "fullName" | "phone" | "address" | "city" | "province" | "postalCode";

const validators: Record<FieldKey, (v: string) => string | null> = {
  fullName: v => {
    if (!v) return "Nama wajib diisi";
    if (v.length < 3) return "Nama minimal 3 karakter";
    if (/[^a-zA-Z\s]/.test(v)) return "Nama tidak valid — tidak boleh mengandung angka atau simbol";
    return null;
  },
  phone: v => {
    if (!v) return "Nomor telepon wajib diisi";
    const digits = v.replace(/\D/g, "");
    if (!v.startsWith("08") && !v.startsWith("+62")) return "Nomor telepon tidak valid — gunakan format 08xxx atau +62xxx";
    if (digits.length < 10 || digits.length > 13) return "Nomor telepon tidak valid — gunakan format 08xxx atau +62xxx";
    return null;
  },
  address: v => {
    if (!v) return "Alamat wajib diisi";
    if (v.length < 10) return "Alamat terlalu singkat atau tidak masuk akal — mohon isi alamat lengkap";
    if (/^\d+$/.test(v.trim())) return "Alamat terlalu singkat atau tidak masuk akal — mohon isi alamat lengkap";
    if (v.trim().split(/\s+/).length < 2) return "Alamat terlalu singkat atau tidak masuk akal — mohon isi alamat lengkap";
    return null;
  },
  city: v => {
    if (!v) return "Kota wajib diisi";
    if (v.length < 3) return "Nama kota tidak valid";
    if (/[^a-zA-Z\s]/.test(v)) return "Nama kota tidak valid";
    return null;
  },
  province: v => {
    if (!v) return "Provinsi wajib dipilih";
    return null;
  },
  postalCode: v => {
    if (!v) return "Kode pos wajib diisi";
    if (!/^\d{5}$/.test(v)) return "Kode pos harus 5 digit angka yang valid";
    if (v === "00000") return "Kode pos harus 5 digit angka yang valid";
    return null;
  },
};

// ── FieldWrapper lives OUTSIDE Checkout so React never remounts inputs ────────
interface FieldWrapperProps {
  label: string;
  name: FieldKey;
  required?: boolean;
  isValid: boolean;
  isError: boolean;
  errorMsg?: string | null;
  children: React.ReactNode;
}

const FieldWrapper = memo(function FieldWrapper({
  label, name, required = true, isValid, isError, errorMsg, children,
}: FieldWrapperProps) {
  return (
    <div>
      <Label className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <div className="relative mt-1.5">
        {children}
        {isValid && <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 pointer-events-none" />}
        {isError && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-red-400 pointer-events-none" />}
      </div>
      {isError && errorMsg && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="h-3 w-3 flex-shrink-0" /> {errorMsg}
        </p>
      )}
    </div>
  );
});

function getInputCls(isError: boolean, isValid: boolean): string {
  return `w-full rounded-xl border bg-gray-50 focus:bg-white px-3 py-2.5 text-sm focus:outline-none pr-9 transition-colors ${
    isError  ? "border-red-300 focus:border-red-400"
    : isValid ? "border-green-300 focus:border-green-400"
    : "border-gray-200 focus:border-blue-400"
  }`;
}

export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { cart, getTotalPrice, clearCart } = useCart();
  const { createOrder } = useOrders();
  const { getUserAddresses } = useAddress();

  const buyNowItems: CartItem[] | undefined = (location.state as any)?.buyNowItems;
  const isBuyNow = Array.isArray(buyNowItems) && buyNowItems.length > 0;
  const activeItems: CartItem[] = isBuyNow ? buyNowItems : cart;

  const subtotal = activeItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const { fee: serviceFee, rate: serviceFeeRate } = calcServiceFee(subtotal);
  const shippingCost = subtotal >= 100_000 ? 0 : 15_000;
  const baseTotal = subtotal + serviceFee + shippingCost;

  const savedAddresses = user ? getUserAddresses(user.id) : [];
  const defaultAddr = savedAddresses.find(a => a.isDefault);

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    defaultAddr ? defaultAddr.id : null
  );
  const [showSaved, setShowSaved] = useState(savedAddresses.length > 0);
  const [showManual, setShowManual] = useState(savedAddresses.length === 0);

  const [shippingData, setShippingData] = useState<ShippingAddress>(() => {
    if (defaultAddr) return {
      fullName: defaultAddr.fullName, phone: defaultAddr.phone,
      address: defaultAddr.address, city: defaultAddr.city,
      province: defaultAddr.province, postalCode: defaultAddr.postalCode,
      notes: defaultAddr.notes || "",
    };
    return { fullName: user?.name || "", phone: "", address: "", city: "", province: "", postalCode: "", notes: "" };
  });

  // ── Validation state ───────────────────────────────────────────────────────
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string | null>>>({});

  const validateField = useCallback((key: FieldKey, value: string) => {
    const err = validators[key](value);
    setFieldErrors(prev => ({ ...prev, [key]: err }));
    return err;
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSelectedAddressId(null);
    setShippingData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    const key = name as FieldKey;
    if (validators[key]) {
      const err = validateField(key, value);
      if (err && touched[key]) toast.warning(err, { id: `warn-${key}`, duration: 2500 });
    }
  };

  // Field status helpers
  const isFieldValid = (key: FieldKey) =>
    touched[key] && !fieldErrors[key] && shippingData[key as keyof ShippingAddress];

  const isFieldError = (key: FieldKey) =>
    touched[key] && !!fieldErrors[key];

  const isFormValid = (Object.keys(validators) as FieldKey[]).every(
    k => !validators[k](shippingData[k as keyof ShippingAddress] as string)
  );

  // ── Coupon state ───────────────────────────────────────────────────────────
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const { validateCoupon, applyCoupon, calculateDiscount } = useCoupon();
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const discountAmount = appliedCoupon ? calculateDiscount(appliedCoupon, subtotal) : 0;
  const finalTotal = Math.max(0, baseTotal - discountAmount);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isBuyNow && cart.length === 0) return <Navigate to="/cart" replace />;

  const handleApplyCoupon = () => {
    const result = validateCoupon(couponInput, subtotal);
    if (!result.valid) { toast.error("Kupon tidak valid", { description: result.error }); return; }
    setAppliedCoupon(result.coupon!);
    toast.success("Kupon berhasil diterapkan!", {
      description: result.coupon!.description || `Hemat ${fmt(calculateDiscount(result.coupon!, subtotal))}`,
    });
  };

  const handleSelectSaved = (id: string) => {
    const addr = savedAddresses.find(a => a.id === id);
    if (!addr) return;
    setSelectedAddressId(id);
    setShippingData({ fullName: addr.fullName, phone: addr.phone, address: addr.address, city: addr.city, province: addr.province, postalCode: addr.postalCode, notes: addr.notes || "" });
    setShowManual(false);
    // Pre-validate all fields from saved address
    const keys: FieldKey[] = ["fullName", "phone", "address", "city", "province", "postalCode"];
    const newErrors: Partial<Record<FieldKey, string | null>> = {};
    const newTouched: Partial<Record<FieldKey, boolean>> = {};
    keys.forEach(k => {
      newErrors[k] = validators[k]((addr as any)[k] || "");
      newTouched[k] = true;
    });
    setFieldErrors(newErrors);
    setTouched(newTouched);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Touch all fields and validate
    const keys: FieldKey[] = ["fullName", "phone", "address", "city", "province", "postalCode"];
    const newTouched: Partial<Record<FieldKey, boolean>> = {};
    const newErrors: Partial<Record<FieldKey, string | null>> = {};
    let hasError = false;
    keys.forEach(k => {
      newTouched[k] = true;
      const err = validators[k](shippingData[k as keyof ShippingAddress] as string);
      newErrors[k] = err;
      if (err) { hasError = true; toast.error(err, { id: `err-${k}` }); }
    });
    setTouched(newTouched);
    setFieldErrors(newErrors);
    if (hasError) return;

    try {
      const breakdown = { subtotal, serviceFee, serviceFeeRate, shippingCost, discountAmount };
      const order = createOrder(user!.id, activeItems, finalTotal, shippingData, paymentMethod, breakdown);
      if (appliedCoupon) applyCoupon(appliedCoupon.code);
      if (!isBuyNow) clearCart();
      toast.success("Pesanan berhasil dibuat!", { description: `Nomor pesanan: ${order.id}` });
      navigate(`/order-confirmation/${order.id}`);
    } catch (err: any) {
      toast.error("Gagal membuat pesanan", { description: err?.message || "Terjadi kesalahan, silakan coba lagi." });
    }
  };

  const LabelIcon = (label: string) => label === "Kantor" ? Building2 : Home;

  // Helpers that use component state — kept stable via derived values passed to FieldWrapper
  const fw = (name: FieldKey) => ({
    name,
    isValid: isFieldValid(name),
    isError: isFieldError(name),
    errorMsg: fieldErrors[name],
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-6 max-w-6xl flex items-center gap-4">
          <button onClick={() => navigate(isBuyNow ? -1 : "/cart")} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {isBuyNow && <Zap className="h-5 w-5 text-orange-500" />}
              {isBuyNow ? "Beli Sekarang" : "Checkout"}
            </h1>
            {isBuyNow && <p className="text-sm text-orange-600 mt-0.5 font-medium">Pembelian langsung · {activeItems.length} produk</p>}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Left column ──────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Shipping Address */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h2 className="font-bold text-gray-900">Alamat Pengiriman</h2>
                </div>

                <div className="p-5 space-y-4">
                  {/* Saved addresses */}
                  {savedAddresses.length > 0 && (
                    <div>
                      <button type="button" onClick={() => setShowSaved(v => !v)}
                        className="flex items-center justify-between w-full text-sm font-semibold text-gray-700 mb-3 hover:text-blue-600 transition-colors">
                        <span className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-blue-500" />
                          Alamat Tersimpan ({savedAddresses.length})
                        </span>
                        {showSaved ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                      </button>

                      {showSaved && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          {savedAddresses.map(addr => {
                            const Icon = LabelIcon(addr.label);
                            const isSel = selectedAddressId === addr.id;
                            return (
                              <button key={addr.id} type="button" onClick={() => handleSelectSaved(addr.id)}
                                className={`text-left p-4 rounded-xl border-2 transition-all w-full ${isSel ? "border-blue-500 bg-blue-50" : "border-gray-100 hover:border-blue-200 bg-white"}`}>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg ${isSel ? "bg-blue-100" : "bg-gray-100"}`}>
                                      <Icon className={`h-3.5 w-3.5 ${isSel ? "text-blue-600" : "text-gray-500"}`} />
                                    </div>
                                    <span className={`text-sm font-semibold ${isSel ? "text-blue-700" : "text-gray-800"}`}>{addr.label}</span>
                                    {addr.isDefault && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-semibold">Utama</span>}
                                  </div>
                                  {isSel && <CheckCircle2 className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                                </div>
                                <p className="text-sm font-medium text-gray-900">{addr.fullName}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{addr.phone}</p>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{addr.address}, {addr.city} {addr.postalCode}</p>
                              </button>
                            );
                          })}
                          <button type="button" onClick={() => navigate("/account?tab=addresses")}
                            className="text-left p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-blue-500 min-h-[100px]">
                            <Plus className="h-5 w-5" />
                            <span className="text-xs font-medium">Tambah Alamat Baru</span>
                          </button>
                        </div>
                      )}

                      <button type="button"
                        onClick={() => { setShowManual(v => !v); if (!showManual) setSelectedAddressId(null); }}
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                        {showManual ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                        {showManual ? "Sembunyikan form manual" : "Isi alamat manual"}
                      </button>
                    </div>
                  )}

                  {/* Manual form */}
                  {(showManual || savedAddresses.length === 0) && (
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${savedAddresses.length > 0 ? "mt-4 pt-4 border-t border-gray-100" : ""}`}>
                      {selectedAddressId && (
                        <div className="md:col-span-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-amber-500 flex-shrink-0" />
                          <p className="text-xs text-amber-700">Mengedit alamat tersimpan — perubahan hanya berlaku untuk pesanan ini</p>
                        </div>
                      )}

                      {/* fullName */}
                      <div className="md:col-span-2">
                        <FieldWrapper label="Nama Lengkap" required {...fw("fullName")}>
                          <input name="fullName" value={shippingData.fullName} onChange={handleInput}
                            placeholder="Nama penerima" className={getInputCls(fw("fullName").isError, fw("fullName").isValid)} />
                        </FieldWrapper>
                      </div>

                      {/* phone */}
                      <FieldWrapper label="Nomor Telepon" required {...fw("phone")}>
                        <input name="phone" type="tel" value={shippingData.phone} onChange={handleInput}
                          placeholder="08xxxxxxxxxx" className={getInputCls(fw("phone").isError, fw("phone").isValid)} />
                      </FieldWrapper>

                      {/* postalCode */}
                      <FieldWrapper label="Kode Pos" required {...fw("postalCode")}>
                        <input name="postalCode" value={shippingData.postalCode} onChange={handleInput}
                          placeholder="12345" maxLength={5} className={getInputCls(fw("postalCode").isError, fw("postalCode").isValid)} />
                      </FieldWrapper>

                      {/* address */}
                      <div className="md:col-span-2">
                        <FieldWrapper label="Alamat Lengkap" required {...fw("address")}>
                          <textarea name="address" rows={3} value={shippingData.address} onChange={handleInput}
                            placeholder="Jalan, nomor rumah, RT/RW, kelurahan, kecamatan"
                            className={`${getInputCls(fw("address").isError, fw("address").isValid)} resize-none`} />
                        </FieldWrapper>
                      </div>

                      {/* city */}
                      <FieldWrapper label="Kota/Kabupaten" required {...fw("city")}>
                        <input name="city" value={shippingData.city} onChange={handleInput}
                          placeholder="Purbalingga" className={getInputCls(fw("city").isError, fw("city").isValid)} />
                      </FieldWrapper>

                      {/* province — dropdown */}
                      <FieldWrapper label="Provinsi" required {...fw("province")}>
                        <select name="province" value={shippingData.province} onChange={handleInput}
                          className={`${getInputCls(fw("province").isError, fw("province").isValid)} appearance-none cursor-pointer`}>
                          <option value="">-- Pilih Provinsi --</option>
                          {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </FieldWrapper>

                      {/* notes */}
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-gray-700">Catatan (Opsional)</Label>
                        <textarea name="notes" rows={2} value={shippingData.notes} onChange={handleInput}
                          placeholder="Catatan untuk kurir atau penjual"
                          className="mt-1.5 w-full rounded-xl border border-gray-200 bg-gray-50 focus:bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none transition-colors" />
                      </div>
                    </div>
                  )}

                  {/* Saved address summary */}
                  {selectedAddressId && !showManual && (() => {
                    const addr = savedAddresses.find(a => a.id === selectedAddressId);
                    if (!addr) return null;
                    return (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-blue-800">{addr.label} — {addr.fullName}</p>
                          <p className="text-xs text-blue-600 mt-0.5">{addr.phone}</p>
                          <p className="text-sm text-blue-700 mt-1">{addr.address}, {addr.city}, {addr.province} {addr.postalCode}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Coupon */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
                  <Ticket className="h-5 w-5 text-blue-600" />
                  <h2 className="font-bold text-gray-900">Kode Kupon</h2>
                </div>
                <div className="p-5">
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <input value={couponInput} onChange={e => setCouponInput(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === "Enter" && handleApplyCoupon()}
                        placeholder="Masukkan kode kupon..."
                        className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono uppercase tracking-wider focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white" />
                      <button type="button" onClick={handleApplyCoupon} disabled={!couponInput.trim()}
                        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors">
                        Pakai
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-green-800 font-mono">{appliedCoupon.code}</p>
                        <p className="text-xs text-green-600 mt-0.5">{appliedCoupon.description || `Hemat ${fmt(discountAmount)}`}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-green-700">−{fmt(discountAmount)}</p>
                        <button type="button" onClick={() => { setAppliedCoupon(null); setCouponInput(""); }}
                          className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-0.5 mt-0.5 ml-auto transition-colors">
                          <X className="h-3 w-3" /> Hapus
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-6 py-4 border-b border-gray-100">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <h2 className="font-bold text-gray-900">Metode Pembayaran</h2>
                </div>
                <div className="p-5">
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    {[
                      { val: "cod", label: "Bayar di Tempat (COD)", sub: "Bayar saat barang diterima" },
                      { val: "transfer", label: "Transfer Bank", sub: "Transfer ke rekening toko" },
                      { val: "ewallet", label: "E-Wallet", sub: "OVO, GoPay, Dana, ShopeePay" },
                    ].map(({ val, label, sub }) => (
                      <label key={val} className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${paymentMethod === val ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
                        <RadioGroupItem value={val} id={val} />
                        <div>
                          <p className="font-medium text-sm text-gray-900">{label}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </div>

            {/* ── Right column — summary ────────────────────────────────── */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 sticky top-20">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-gray-400" />
                  Ringkasan Pesanan
                  {isBuyNow && <span className="ml-auto text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-semibold">Beli Sekarang</span>}
                </h2>

                <div className="space-y-3 mb-5 max-h-48 overflow-y-auto">
                  {activeItems.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl flex-shrink-0 border border-gray-100" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.quantity} × {fmt(item.price)}</p>
                        <p className="text-sm font-bold text-blue-600 mt-0.5">{fmt(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price breakdown */}
                <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium text-gray-900">{fmt(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1">
                      <Percent className="h-3 w-3 text-gray-400" />
                      Biaya Layanan ({serviceFeeRate}%)
                    </span>
                    <span className="font-medium text-gray-900">{fmt(serviceFee)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Ongkos Kirim</span>
                    <span className={shippingCost === 0 ? "text-green-600 font-medium" : "font-medium text-gray-900"}>
                      {shippingCost === 0 ? "Gratis" : fmt(shippingCost)}
                    </span>
                  </div>
                  {appliedCoupon && discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center gap-1.5">
                        <Ticket className="h-3.5 w-3.5" /> Diskon ({appliedCoupon.code})
                      </span>
                      <span className="font-semibold">−{fmt(discountAmount)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-100 pt-2.5 flex justify-between">
                    <span className="font-bold text-gray-900">Total Bayar</span>
                    <span className="font-bold text-xl text-blue-600">{fmt(finalTotal)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`w-full mt-5 h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                    !isFormValid
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : isBuyNow
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-orange-200"
                      : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-200"
                  }`}
                >
                  {isBuyNow ? <Zap className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                  {!isFormValid ? "Lengkapi Data Pengiriman" : isBuyNow ? "Bayar Sekarang" : "Lanjut ke Pembayaran"}
                </button>

                {!isFormValid && (
                  <p className="text-xs text-amber-600 text-center mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Isi semua field alamat dengan benar
                  </p>
                )}

                <p className="text-xs text-gray-400 text-center mt-3">
                  Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
