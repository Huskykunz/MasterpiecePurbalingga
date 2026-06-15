import { useState } from "react";
import { products } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { Input } from "../components/ui/input";
import { Search, SlidersHorizontal, Package } from "lucide-react";

const categories = ["Semua", ...Array.from(new Set(products.map((p) => p.category)))];

export default function Shop() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");

  const filtered = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    const matchCat = selectedCategory === "Semua" || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-10">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Marketplace</p>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Koleksi Knalpot</h1>
          <p className="text-gray-500">{products.length} produk tersedia dari pengrajin pilihan</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters bar */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari produk..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 border-gray-200 rounded-xl bg-gray-50 focus:bg-white"
            />
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <SlidersHorizontal className="h-4 w-4 text-gray-400 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results info */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-gray-500">
            Menampilkan <span className="font-semibold text-gray-800">{filtered.length}</span> produk
            {selectedCategory !== "Semua" && <span> · {selectedCategory}</span>}
          </p>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Tidak ada produk yang sesuai.</p>
            <button onClick={() => { setSearchQuery(""); setSelectedCategory("Semua"); }} className="mt-3 text-sm text-blue-600 hover:underline">
              Reset filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
