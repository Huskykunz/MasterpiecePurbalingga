import { useState } from "react";
import {
  Package, Users, ShoppingCart, Plus, Edit, Trash2, Eye,
  X, Sparkles, Percent, Tag, Image, Layers, ChevronDown, ChevronUp, BarChart2,
  Ticket, ToggleLeft, ToggleRight, AlertCircle
} from "lucide-react";
import { useCoupon, Coupon } from "../context/CouponContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";
import { Product, ProductVariation, ProductDiscount } from "../types";
import { getDiscountedPrice, formatRp, generateSKU } from "../utils/priceUtils";
import { useProducts } from "../hooks/useProducts";
import { useSellerProducts } from "../context/SellerProductContext";
import { useAuth } from "../context/AuthContext";

// ─── Types ───────────────────────────────────────────────────────────────────
interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  images: string[];
  sku: string;
  stock: string;
  // Discount
  hasDiscount: boolean;
  discountType: "percentage" | "fixed";
  discountValue: string;
  discountLabel: string;
  discountExpiry: string;
  // Variations
  variations: Omit<ProductVariation, "id">[];
}

const EMPTY_FORM: ProductFormData = {
  name: "", description: "", price: "", category: "Sport",
  image: "", images: ["", "", "", ""], sku: "", stock: "10",
  hasDiscount: false, discountType: "percentage", discountValue: "", discountLabel: "", discountExpiry: "",
  variations: [],
};

const CATEGORIES = ["Sport", "Racing", "Custom", "Titanium", "Street", "Performance", "Carbon", "Cruiser", "Stainless", "Black", "Universal", "GP"];
const ATTRIBUTES = ["Ukuran", "Warna", "Material", "Tipe", "Diameter"];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("products");
  const { coupons, addCoupon, deleteCoupon, toggleCoupon } = useCoupon();

  // Coupon form state
  const emptyCouponForm = { code: "", type: "percentage" as "percentage" | "fixed", value: "", minOrder: "", maxDiscount: "", expiresAt: "", usageLimit: "100", isActive: true };
  const [couponForm, setCouponForm] = useState(emptyCouponForm);
  const [couponDeleteConfirm, setCouponDeleteConfirm] = useState<{ id: string; code: string } | null>(null);
  // ── Product data from the shared live store ──────────────────────────────
  const allProducts = useProducts();
  const { addProduct: addSellerProduct, updateProduct: updateSellerProduct, deleteProduct: deleteSellerProduct } = useSellerProducts();
  const { user } = useAuth();

  const [modal, setModal] = useState<{ mode: "add" | "edit"; id?: string } | null>(null);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; name: string } | null>(null);
  const [varOpen, setVarOpen] = useState(true);
  const [discOpen, setDiscOpen] = useState(false);
  const [imgOpen, setImgOpen] = useState(false);

  const partners = [
    { id: 1, name: "Bengkel Jaya Motor", email: "jaya@masterpiece.com", phone: "+62 812-1111-2222", status: "Aktif", products: 4 },
    { id: 2, name: "Workshop Exhaust Pro", email: "exhaustpro@masterpiece.com", phone: "+62 821-3333-4444", status: "Aktif", products: 5 },
    { id: 3, name: "Knalpot Nusantara", email: "nusantara@masterpiece.com", phone: "+62 813-5555-6666", status: "Aktif", products: 3 },
  ];

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const openAdd = () => { setForm(EMPTY_FORM); setModal({ mode: "add" }); setVarOpen(true); setDiscOpen(false); setImgOpen(false); };

  const openEdit = (product: Product) => {
    setForm({
      name: product.name, description: product.description,
      price: String(product.price), category: product.category,
      image: product.image, images: [...(product.images || []), "", "", "", ""].slice(0, 4),
      sku: product.sku || "", stock: String(product.stock || 0),
      hasDiscount: !!product.discount,
      discountType: product.discount?.type || "percentage",
      discountValue: product.discount ? String(product.discount.value) : "",
      discountLabel: product.discount?.label || "",
      discountExpiry: product.discount?.expiresAt ? product.discount.expiresAt.slice(0, 10) : "",
      variations: (product.variations || []).map(v => ({ attribute: v.attribute, name: v.name, priceAdjustment: v.priceAdjustment, stock: v.stock, sku: v.sku })),
    });
    setModal({ mode: "edit", id: product.id });
  };

  const handleDelete = (id: string) => {
    // Routes through SellerProductContext → persists in shared localStorage key
    deleteSellerProduct(id);
    setDeleteConfirm(null);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.price) { alert("Nama dan harga wajib diisi"); return; }
    const price = parseInt(form.price) || 0;
    const stock = parseInt(form.stock) || 0;

    const discount: ProductDiscount | undefined = form.hasDiscount && form.discountValue
      ? { type: form.discountType, value: parseFloat(form.discountValue) || 0, label: form.discountLabel || undefined, expiresAt: form.discountExpiry ? new Date(form.discountExpiry).toISOString() : undefined }
      : undefined;

    const variations: ProductVariation[] = form.variations
      .filter(v => v.attribute && v.name)
      .map((v, i) => ({ ...v, id: `var-${Date.now()}-${i}` }));

    const images = form.images.filter(Boolean);
    const updates = {
      name: form.name, description: form.description, price,
      category: form.category, image: form.image || "https://placehold.co/400x400?text=Produk",
      images: images.length > 0 ? images : undefined,
      sku: form.sku || undefined, inStock: stock > 0, stock, discount,
      variations: variations.length > 0 ? variations : undefined,
    };

    if (modal?.mode === "add") {
      // Admin-added products go into the shared SellerProductContext store
      addSellerProduct({ ...updates, sellerId: user?.id || "admin", sellerName: user?.name || "Admin" });
    } else if (modal?.id) {
      updateSellerProduct(modal.id, updates);
    }
    setModal(null);
  };

  const addVariationRow = () => setForm(f => ({ ...f, variations: [...f.variations, { attribute: "Ukuran", name: "", priceAdjustment: 0, stock: 0, sku: "" }] }));
  const removeVariation = (i: number) => setForm(f => ({ ...f, variations: f.variations.filter((_, idx) => idx !== i) }));
  const updateVariation = (i: number, key: string, value: string | number) =>
    setForm(f => ({ ...f, variations: f.variations.map((v, idx) => idx === i ? { ...v, [key]: value } : v) }));

  const sectionHeader = (label: string, open: boolean, toggle: () => void, icon: React.ReactNode) => (
    <button type="button" onClick={toggle} className="flex items-center justify-between w-full py-2.5 border-b border-gray-100 text-sm font-semibold text-gray-800 hover:text-blue-600 transition-colors">
      <span className="flex items-center gap-2">{icon}{label}</span>
      {open ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
          <p className="text-gray-500 text-sm mt-0.5">Kelola produk, mitra, dan pesanan</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Produk", value: allProducts.length, icon: Package, color: "bg-blue-50 text-blue-600" },
            { label: "Mitra Pengrajin", value: partners.length, icon: Users, color: "bg-green-50 text-green-600" },
            { label: "Produk Diskon", value: allProducts.filter(p => p.discount).length, icon: Percent, color: "bg-orange-50 text-orange-600" },
            { label: "Produk Bervariasi", value: allProducts.filter(p => p.variations?.length).length, icon: Layers, color: "bg-purple-50 text-purple-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label}>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs mb-1">{label}</p>
                  <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`rounded-xl p-2.5 ${color}`}><Icon className="h-5 w-5" /></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="products">Produk</TabsTrigger>
            <TabsTrigger value="partners">Mitra Pengrajin</TabsTrigger>
            <TabsTrigger value="orders">Pesanan</TabsTrigger>
            <TabsTrigger value="coupons">Kupon</TabsTrigger>
          </TabsList>

          {/* ── PRODUCTS TAB ─────────────────────────────────────────── */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between p-5 border-b">
                <div>
                  <h2 className="font-bold text-gray-900">Manajemen Produk</h2>
                  <p className="text-gray-500 text-sm">{allProducts.length} produk terdaftar</p>
                </div>
                <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-500">
                  <Plus className="h-4 w-4 mr-2" /> Tambah Produk
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-16">Gambar</TableHead>
                        <TableHead>Nama Produk</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Harga</TableHead>
                        <TableHead>Stok</TableHead>
                        <TableHead>Variasi</TableHead>
                        <TableHead>Diskon</TableHead>
                        <TableHead className="text-center">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allProducts.map((product) => {
                        const { finalPrice, hasDiscount, discountLabel } = getDiscountedPrice(product);
                        return (
                          <TableRow key={product.id} className="hover:bg-gray-50/60">
                            <TableCell>
                              <div className="relative w-12 h-12">
                                <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-gray-100" />
                                {hasDiscount && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-bold px-1 rounded">%</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <p className="font-semibold text-sm text-gray-900">{product.name}</p>
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{product.description}</p>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                {product.sku || "—"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{product.category}</span>
                            </TableCell>
                            <TableCell>
                              {hasDiscount ? (
                                <div>
                                  <p className="text-sm font-bold text-red-600">{formatRp(finalPrice)}</p>
                                  <p className="text-xs line-through text-gray-400">{formatRp(product.price)}</p>
                                </div>
                              ) : (
                                <p className="text-sm font-semibold text-gray-900">{formatRp(product.price)}</p>
                              )}
                            </TableCell>
                            <TableCell>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${(product.stock || 0) > 10 ? "bg-green-100 text-green-700" : (product.stock || 0) > 0 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                                {product.stock || 0} unit
                              </span>
                            </TableCell>
                            <TableCell>
                              {product.variations?.length ? (
                                <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                                  {product.variations.length} variasi
                                </span>
                              ) : <span className="text-xs text-gray-300">—</span>}
                            </TableCell>
                            <TableCell>
                              {hasDiscount ? (
                                <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-semibold">{discountLabel}</span>
                              ) : <span className="text-xs text-gray-300">—</span>}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-1.5">
                                <button onClick={() => openEdit(product)} className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors" title="Edit">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button onClick={() => setDeleteConfirm({ id: product.id, name: product.name })} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Hapus">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── PARTNERS TAB ─────────────────────────────────────────── */}
          <TabsContent value="partners">
            <Card>
              <CardHeader className="p-5 border-b">
                <h2 className="font-bold text-gray-900">Mitra Pengrajin</h2>
                <p className="text-gray-500 text-sm">Kelola pendaftaran dan aktivitas mitra</p>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Nama</TableHead><TableHead>Email</TableHead>
                      <TableHead>Telepon</TableHead><TableHead>Produk</TableHead>
                      <TableHead>Status</TableHead><TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium text-sm">{p.name}</TableCell>
                        <TableCell className="text-sm text-gray-500">{p.email}</TableCell>
                        <TableCell className="text-sm text-gray-500">{p.phone}</TableCell>
                        <TableCell className="text-sm">{p.products} produk</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${p.status === "Aktif" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>{p.status}</span>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm" className="text-xs">Lihat</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── ORDERS TAB ───────────────────────────────────────────── */}
          <TabsContent value="orders">
            <Card>
              <CardHeader className="p-5 border-b">
                <h2 className="font-bold text-gray-900">Pesanan Terbaru</h2>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>ID</TableHead><TableHead>Pelanggan</TableHead>
                      <TableHead>Produk</TableHead><TableHead>Harga</TableHead>
                      <TableHead>Tanggal</TableHead><TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { id: "#001", customer: "Ahmad Yani", product: "Knalpot Sport Dual Tip", price: "Rp 450.000", status: "Diproses", date: "2025-01-08" },
                      { id: "#002", customer: "Siti Nurhaliza", product: "Muffler Racing Pro", price: "Rp 380.000", status: "Dikirim", date: "2025-01-07" },
                      { id: "#003", customer: "Bambang Susilo", product: "Ujung Knalpot Carbon", price: "Rp 410.000", status: "Selesai", date: "2025-01-06" },
                    ].map(o => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs">{o.id}</TableCell>
                        <TableCell className="text-sm">{o.customer}</TableCell>
                        <TableCell className="text-sm">{o.product}</TableCell>
                        <TableCell className="text-sm font-semibold">{o.price}</TableCell>
                        <TableCell className="text-sm text-gray-500">{o.date}</TableCell>
                        <TableCell>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${o.status === "Selesai" ? "bg-green-100 text-green-700" : o.status === "Dikirim" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}>{o.status}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── COUPON TAB ───────────────────────────────────────────── */}
          <TabsContent value="coupons">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Create form */}
              <Card className="lg:col-span-1 h-fit">
                <CardHeader className="p-5 border-b">
                  <h2 className="font-bold text-gray-900">Buat Kupon Baru</h2>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Kode Kupon *</label>
                    <input value={couponForm.code} onChange={e => setCouponForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                      placeholder="DISKON10" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono uppercase bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tipe Diskon</label>
                    <select value={couponForm.type} onChange={e => setCouponForm(f => ({ ...f, type: e.target.value as any }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400">
                      <option value="percentage">Persentase (%)</option>
                      <option value="fixed">Nominal (Rp)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                      Nilai Diskon {couponForm.type === "percentage" ? "(%)" : "(Rp)"} *
                    </label>
                    <input type="number" value={couponForm.value} onChange={e => setCouponForm(f => ({ ...f, value: e.target.value }))}
                      placeholder={couponForm.type === "percentage" ? "10" : "25000"} min="1"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400" />
                  </div>
                  {couponForm.type === "percentage" && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Maks Diskon (Rp)</label>
                      <input type="number" value={couponForm.maxDiscount} onChange={e => setCouponForm(f => ({ ...f, maxDiscount: e.target.value }))}
                        placeholder="50000" min="0"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400" />
                    </div>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Minimal Order (Rp) *</label>
                    <input type="number" value={couponForm.minOrder} onChange={e => setCouponForm(f => ({ ...f, minOrder: e.target.value }))}
                      placeholder="100000" min="0"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tanggal Kadaluarsa *</label>
                    <input type="date" value={couponForm.expiresAt} onChange={e => setCouponForm(f => ({ ...f, expiresAt: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Batas Pemakaian *</label>
                    <input type="number" value={couponForm.usageLimit} onChange={e => setCouponForm(f => ({ ...f, usageLimit: e.target.value }))}
                      placeholder="100" min="1"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400" />
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input type="checkbox" checked={couponForm.isActive} onChange={e => setCouponForm(f => ({ ...f, isActive: e.target.checked }))}
                      className="w-4 h-4 accent-blue-600 rounded" />
                    <span className="text-sm font-medium text-gray-700">Aktif langsung</span>
                  </label>
                  <button
                    onClick={() => {
                      if (!couponForm.code.trim() || !couponForm.value || !couponForm.minOrder || !couponForm.expiresAt || !couponForm.usageLimit) {
                        alert("Lengkapi semua field wajib"); return;
                      }
                      addCoupon({
                        code: couponForm.code.trim().toUpperCase(),
                        type: couponForm.type,
                        value: parseFloat(couponForm.value) || 0,
                        minOrder: parseFloat(couponForm.minOrder) || 0,
                        maxDiscount: couponForm.type === "percentage" && couponForm.maxDiscount ? parseFloat(couponForm.maxDiscount) : undefined,
                        expiresAt: new Date(couponForm.expiresAt).toISOString(),
                        usageLimit: parseInt(couponForm.usageLimit) || 1,
                        isActive: couponForm.isActive,
                      });
                      setCouponForm(emptyCouponForm);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Buat Kupon
                  </button>
                </CardContent>
              </Card>

              {/* Coupon list */}
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-gray-500">{coupons.length} kupon terdaftar</p>
                </div>
                {coupons.length === 0 ? (
                  <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center shadow-sm">
                    <Ticket className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">Belum ada kupon. Buat kupon pertama di form sebelah.</p>
                  </div>
                ) : (
                  coupons.map(c => {
                    const isExpired = new Date(c.expiresAt) < new Date();
                    const isExhausted = c.usedCount >= c.usageLimit;
                    const statusColor = !c.isActive ? "bg-gray-100 text-gray-500" : isExpired ? "bg-red-100 text-red-600" : isExhausted ? "bg-orange-100 text-orange-600" : "bg-green-100 text-green-700";
                    const statusLabel = !c.isActive ? "Nonaktif" : isExpired ? "Kadaluarsa" : isExhausted ? "Habis" : "Aktif";
                    const fmt2 = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

                    return (
                      <div key={c.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-gray-900 font-mono text-base tracking-wider">{c.code}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${statusColor}`}>{statusLabel}</span>
                              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{c.type === "percentage" ? `${c.value}%` : fmt2(c.value)} OFF</span>
                            </div>
                            {c.description && <p className="text-xs text-gray-400 mt-1">{c.description}</p>}
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button onClick={() => toggleCoupon(c.id)}
                              className={`p-1.5 rounded-lg transition-colors ${c.isActive ? "text-green-500 hover:bg-green-50" : "text-gray-400 hover:bg-gray-100"}`}
                              title={c.isActive ? "Nonaktifkan" : "Aktifkan"}>
                              {c.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                            </button>
                            <button onClick={() => setCouponDeleteConfirm({ id: c.id, code: c.code })}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Hapus">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-gray-500">
                          <div><p className="text-gray-400">Min. Order</p><p className="font-semibold text-gray-700">{fmt2(c.minOrder)}</p></div>
                          {c.maxDiscount && <div><p className="text-gray-400">Maks. Diskon</p><p className="font-semibold text-gray-700">{fmt2(c.maxDiscount)}</p></div>}
                          <div><p className="text-gray-400">Pemakaian</p><p className="font-semibold text-gray-700">{c.usedCount}/{c.usageLimit}</p></div>
                          <div><p className="text-gray-400">Kadaluarsa</p><p className={`font-semibold ${isExpired ? "text-red-600" : "text-gray-700"}`}>{new Date(c.expiresAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</p></div>
                        </div>
                        {/* Usage bar */}
                        <div className="mt-3">
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${isExhausted ? "bg-orange-400" : "bg-blue-500"}`}
                              style={{ width: `${Math.min(100, (c.usedCount / c.usageLimit) * 100)}%` }} />
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">{c.usedCount} dari {c.usageLimit} kupon terpakai</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </TabsContent>

        </Tabs>
      </div>

      {/* ── COUPON DELETE CONFIRM ─────────────────────────────────── */}
      {couponDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Hapus Kupon?</h3>
            <p className="text-sm text-gray-500 mb-5">Kupon <span className="font-bold font-mono text-gray-800">{couponDeleteConfirm.code}</span> akan dihapus permanen.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setCouponDeleteConfirm(null)}>Batal</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={() => { deleteCoupon(couponDeleteConfirm.id); setCouponDeleteConfirm(null); }}>Hapus</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT PRODUCT MODAL ───────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">{modal.mode === "add" ? "Tambah Produk Baru" : "Edit Produk"}</h3>
                <p className="text-xs text-gray-400 mt-0.5">Isi semua informasi produk dengan lengkap</p>
              </div>
              <button onClick={() => setModal(null)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><X className="h-5 w-5" /></button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

              {/* ── Basic Info ── */}
              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Informasi Dasar</p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Produk *</label>
                    <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama produk..." className="rounded-xl border-gray-200 bg-gray-50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Harga (Rp) *</label>
                    <Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="350000" min="0" className="rounded-xl border-gray-200 bg-gray-50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Stok</label>
                    <Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} min="0" className="rounded-xl border-gray-200 bg-gray-50 focus:bg-white" />
                  </div>
                  {/* SKU */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><Tag className="h-3.5 w-3.5 text-gray-400" />SKU</label>
                    <div className="flex gap-2">
                      <Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} placeholder="KNL-SPT-001" className="flex-1 rounded-xl border-gray-200 bg-gray-50 focus:bg-white font-mono text-sm" />
                      <button type="button" onClick={() => setForm(f => ({ ...f, sku: generateSKU(f.category, allProducts.length) }))} className="flex items-center gap-1 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-xl text-xs hover:bg-gray-50 whitespace-nowrap">
                        <Sparkles className="h-3 w-3" /> Auto
                      </button>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
                    <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Deskripsi produk..." className="rounded-xl border-gray-200 bg-gray-50 focus:bg-white resize-none" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">URL Gambar Utama</label>
                    <Input value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} placeholder="https://..." className="rounded-xl border-gray-200 bg-gray-50 focus:bg-white" />
                    {form.image && <img src={form.image} alt="preview" className="mt-2 h-24 w-24 object-cover rounded-xl border border-gray-100" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                  </div>
                </div>
              </div>

              {/* ── Additional Photos ── */}
              <div>
                {sectionHeader("Foto Tambahan (maks. 4)", imgOpen, () => setImgOpen(v => !v), <Image className="h-4 w-4 text-gray-400" />)}
                {imgOpen && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {form.images.map((url, i) => (
                      <div key={i}>
                        <label className="block text-xs text-gray-500 mb-1">Foto {i + 1}</label>
                        <Input value={url} onChange={e => setForm(f => { const imgs = [...f.images]; imgs[i] = e.target.value; return { ...f, images: imgs }; })} placeholder="https://..." className="rounded-xl border-gray-200 bg-gray-50 focus:bg-white text-sm" />
                        {url && <img src={url} alt="" className="mt-1.5 h-16 w-16 object-cover rounded-lg border border-gray-100" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Discount ── */}
              <div>
                {sectionHeader("Diskon & Promo", discOpen, () => setDiscOpen(v => !v), <Percent className="h-4 w-4 text-gray-400" />)}
                {discOpen && (
                  <div className="mt-3 space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.hasDiscount} onChange={e => setForm(f => ({ ...f, hasDiscount: e.target.checked }))} className="accent-blue-600 w-4 h-4 rounded" />
                      <span className="text-sm font-medium text-gray-700">Aktifkan Diskon</span>
                    </label>
                    {form.hasDiscount && (
                      <div className="grid grid-cols-2 gap-3 pl-6">
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Tipe Diskon</label>
                          <select value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value as "percentage" | "fixed" }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none">
                            <option value="percentage">Persentase (%)</option>
                            <option value="fixed">Nominal (Rp)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Nilai Diskon</label>
                          <Input type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} placeholder={form.discountType === "percentage" ? "20" : "50000"} min="0" className="rounded-xl border-gray-200 bg-gray-50 focus:bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Label (opsional)</label>
                          <Input value={form.discountLabel} onChange={e => setForm(f => ({ ...f, discountLabel: e.target.value }))} placeholder="Promo Spesial" className="rounded-xl border-gray-200 bg-gray-50 focus:bg-white" />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Berlaku hingga</label>
                          <Input type="date" value={form.discountExpiry} onChange={e => setForm(f => ({ ...f, discountExpiry: e.target.value }))} className="rounded-xl border-gray-200 bg-gray-50 focus:bg-white" />
                        </div>
                        {form.discountValue && (
                          <div className="col-span-2 bg-orange-50 border border-orange-100 rounded-xl p-3 text-sm">
                            <p className="text-orange-700 font-medium">Preview:</p>
                            <p className="text-orange-600">{formatRp(parseInt(form.price) || 0)} → {formatRp(form.discountType === "percentage" ? Math.round((parseInt(form.price) || 0) * (1 - (parseFloat(form.discountValue) || 0) / 100)) : Math.max(0, (parseInt(form.price) || 0) - (parseFloat(form.discountValue) || 0)))}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ── Variations ── */}
              <div>
                {sectionHeader(`Variasi Produk${form.variations.length ? ` (${form.variations.length})` : ""}`, varOpen, () => setVarOpen(v => !v), <Layers className="h-4 w-4 text-gray-400" />)}
                {varOpen && (
                  <div className="mt-3 space-y-2">
                    {form.variations.length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-4 border border-dashed border-gray-200 rounded-xl">Belum ada variasi. Klik "+ Tambah Variasi" untuk menambahkan.</p>
                    )}
                    {form.variations.map((v, i) => (
                      <div key={i} className="grid grid-cols-[1fr_1fr_80px_80px_1fr_32px] gap-2 items-end p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">Atribut</label>
                          <select value={v.attribute} onChange={e => updateVariation(i, "attribute", e.target.value)} className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white focus:outline-none">
                            {ATTRIBUTES.map(a => <option key={a}>{a}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">Nama Nilai</label>
                          <Input value={v.name} onChange={e => updateVariation(i, "name", e.target.value)} placeholder="Large, Hitam..." className="text-xs h-8 rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">+/- Harga</label>
                          <Input type="number" value={v.priceAdjustment} onChange={e => updateVariation(i, "priceAdjustment", parseInt(e.target.value) || 0)} className="text-xs h-8 rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">Stok</label>
                          <Input type="number" value={v.stock} onChange={e => updateVariation(i, "stock", parseInt(e.target.value) || 0)} min="0" className="text-xs h-8 rounded-lg" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-gray-400 mb-1">SKU Variasi</label>
                          <Input value={v.sku} onChange={e => updateVariation(i, "sku", e.target.value)} placeholder="KNL-SPT-001-L" className="text-xs h-8 rounded-lg font-mono" />
                        </div>
                        <button type="button" onClick={() => removeVariation(i)} className="h-8 w-8 flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addVariationRow} className="flex items-center gap-1.5 text-blue-600 text-sm hover:underline mt-1">
                      <Plus className="h-4 w-4" /> Tambah Variasi
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <Button variant="outline" className="flex-1" onClick={() => setModal(null)}>Batal</Button>
              <Button className="flex-1 bg-blue-600 hover:bg-blue-500" onClick={handleSave}>
                {modal.mode === "add" ? "Tambah Produk" : "Simpan Perubahan"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ─────────────────────────────────────────── */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Hapus Produk?</h3>
            <p className="text-sm text-gray-500 mb-5">"{deleteConfirm.name}" akan dihapus secara permanen.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>Batal</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={() => handleDelete(deleteConfirm.id)}>Hapus</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
