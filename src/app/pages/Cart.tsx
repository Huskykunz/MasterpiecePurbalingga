import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { CartItem } from "../types";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, Truck, Zap } from "lucide-react";

const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function Cart() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();

  // Checklist state — all selected by default
  const [selected, setSelected] = useState<Set<string>>(() => new Set(cart.map(i => i.id)));

  const toggleItem = (id: string) =>
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const allChecked = cart.length > 0 && cart.every(i => selected.has(i.id));
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(cart.map(i => i.id)));

  const selectedItems = cart.filter(i => selected.has(i.id));
  const subtotal = selectedItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = selectedItems.length === 0 ? 0 : subtotal >= 100000 ? 0 : 15000;
  const total = subtotal + shipping;

  const handleBuyItem = (item: CartItem) => {
    if (!isAuthenticated) { navigate("/login"); return; }
    navigate("/checkout", { state: { buyNowItems: [item] } });
  };

  const handleCheckoutSelected = () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (selectedItems.length === 0) return;
    navigate("/checkout", { state: { buyNowItems: selectedItems } });
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Keranjang Kosong</h2>
          <p className="text-gray-500 mb-8">Yuk, temukan produk knalpot impian Anda!</p>
          <Link to="/shop">
            <Button className="bg-blue-600 hover:bg-blue-500">Lihat Produk <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Keranjang Belanja</h1>
            <p className="text-gray-500 text-sm mt-0.5">{cart.length} produk · {selected.size} dipilih</p>
          </div>
          <button onClick={clearCart} className="text-sm text-gray-400 hover:text-red-500 transition-colors">Kosongkan</button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {/* Select all row */}
            <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-3">
              <button onClick={toggleAll} className="flex items-center gap-2.5 group">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${allChecked ? "bg-blue-600 border-blue-600" : "border-gray-300 group-hover:border-blue-400"}`}>
                  {allChecked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                  {!allChecked && selected.size > 0 && <div className="w-2.5 h-0.5 bg-blue-400 rounded" />}
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
                  {allChecked ? "Batal Pilih Semua" : "Pilih Semua"}
                </span>
              </button>
              {selected.size > 0 && !allChecked && (
                <span className="text-xs text-gray-400 ml-auto">{selected.size} dipilih</span>
              )}
            </div>

            {/* Cart items */}
            {cart.map(item => {
              const isChecked = selected.has(item.id);
              return (
                <div key={item.id} className={`bg-white border-2 rounded-2xl shadow-sm overflow-hidden transition-colors ${isChecked ? "border-blue-200" : "border-gray-100"}`}>
                  <div className="flex gap-3 p-4">
                    {/* Checkbox */}
                    <button onClick={() => toggleItem(item.id)} className="flex-shrink-0 mt-1">
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${isChecked ? "bg-blue-600 border-blue-600" : "border-gray-300 hover:border-blue-400"}`}>
                        {isChecked && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                      </div>
                    </button>

                    {/* Thumbnail */}
                    <Link to={`/product/${item.id}`} className="flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl border border-gray-100" />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.id}`}>
                        <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate text-sm">{item.name}</h3>
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5">{item.category}{item.sellerName ? ` · ${item.sellerName}` : ""}</p>
                      <p className="text-blue-600 font-bold mt-2 text-sm">{fmt(item.price)}</p>
                      {isChecked && (
                        <p className="text-xs text-gray-400 mt-0.5">Subtotal: <span className="font-semibold text-gray-700">{fmt(item.price * item.quantity)}</span></p>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex flex-col items-end justify-between gap-2 flex-shrink-0">
                      <button onClick={() => removeFromCart(item.id)} className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors" title="Hapus">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleBuyItem(item)} className="flex items-center gap-1.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm shadow-orange-200 transition-all hover:scale-105" title="Beli produk ini saja">
                        <Zap className="h-3 w-3" /> Beli
                      </button>
                      <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl p-1">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 disabled:opacity-30 hover:bg-blue-50 transition-colors">
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-blue-50 transition-colors">
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-20">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Ringkasan Pesanan</h2>

              {selectedItems.length === 0 && (
                <div className="text-center py-4 mb-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-400">Pilih produk yang ingin dibeli</p>
                </div>
              )}

              {selectedItems.length > 0 && subtotal < 100000 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <p className="text-xs text-blue-700">Tambah <strong>{fmt(100000 - subtotal)}</strong> lagi untuk gratis ongkir!</p>
                </div>
              )}
              {selectedItems.length > 0 && shipping === 0 && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-4 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <p className="text-xs text-green-700">Selamat! Anda mendapat <strong>gratis ongkir</strong></p>
                </div>
              )}

              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({selectedItems.reduce((s, i) => s + i.quantity, 0)} item)</span>
                  <span className="font-medium text-gray-900">{fmt(subtotal)}</span>
                </div>
                {selectedItems.length > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Ongkos Kirim</span>
                    <span className={shipping === 0 ? "text-green-600 font-medium" : "font-medium text-gray-900"}>
                      {shipping === 0 ? "Gratis" : fmt(shipping)}
                    </span>
                  </div>
                )}
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-xl text-blue-600">{fmt(total)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutSelected}
                disabled={selectedItems.length === 0}
                className="w-full mt-5 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                Checkout ({selected.size}) <ArrowRight className="h-4 w-4" />
              </button>
              <Link to="/shop">
                <Button variant="outline" className="w-full mt-3 h-10 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50">
                  Lanjut Belanja
                </Button>
              </Link>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <Zap className="h-3 w-3 text-orange-400" />
                <span>Tombol <span className="text-orange-500 font-medium">Beli</span> = checkout satu produk saja</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
