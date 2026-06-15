import { Link } from "react-router";
import { useCart } from "../context/CartContext";
import { Button } from "../components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag, Truck } from "lucide-react";

const fmt = (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const subtotal = getTotalPrice();
  const shipping = subtotal >= 100000 ? 0 : 15000;
  const total = subtotal + shipping;

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
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-gray-900">Keranjang Belanja</h1>
          <p className="text-gray-500 text-sm mt-1">{cart.length} produk</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2 space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex gap-4">
                <Link to={`/product/${item.id}`} className="flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-xl" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.id}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate">{item.name}</h3>
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">{item.category} · {item.sellerName}</p>
                  <p className="text-blue-600 font-bold mt-2">{fmt(item.price)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}
                      className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 disabled:opacity-30 hover:bg-blue-50 transition-colors">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-6 h-6 rounded-lg bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-blue-50 transition-colors">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={clearCart} className="text-sm text-gray-400 hover:text-red-500 transition-colors mt-1">
              Kosongkan keranjang
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm sticky top-20">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Ringkasan Pesanan</h2>

              {subtotal < 100000 && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-5 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-500 flex-shrink-0" />
                  <p className="text-xs text-blue-700">
                    Tambah <strong>{fmt(100000 - subtotal)}</strong> lagi untuk gratis ongkir!
                  </p>
                </div>
              )}
              {shipping === 0 && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 mb-5 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-green-500 flex-shrink-0" />
                  <p className="text-xs text-green-700">Selamat! Anda mendapat <strong>gratis ongkir</strong></p>
                </div>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span><span className="font-medium text-gray-900">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Ongkos Kirim</span>
                  <span className={shipping === 0 ? "text-green-600 font-medium" : "font-medium text-gray-900"}>
                    {shipping === 0 ? "Gratis" : fmt(shipping)}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-xl text-blue-600">{fmt(total)}</span>
                </div>
              </div>

              <Link to="/checkout">
                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-500 h-11 rounded-xl">
                  Lanjut ke Checkout <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/shop">
                <Button variant="outline" className="w-full mt-3 h-10 rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50">
                  Lanjut Belanja
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
