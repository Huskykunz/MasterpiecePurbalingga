import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ProductCard } from "../components/ProductCard";
import { Input } from "../components/ui/input";
import { Search, SlidersHorizontal, Package, ChevronDown, X, Star, TrendingUp, ArrowUpDown } from "lucide-react";
import { useStock } from "../context/StockContext";
import { useSellerProducts } from "../context/SellerProductContext";

type SortOption = "default" | "price-asc" | "price-desc" | "rating" | "newest";
const SORT_LABELS: Record<SortOption, string> = {
  default:    "Relevansi",
  "price-asc":  "Harga Terendah",
  "price-desc": "Harga Tertinggi",
  rating:     "Rating Tertinggi",
  newest:     "Terbaru",
};

function useOutsideClick(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) cb(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [ref, cb]);
}

/** Renders children into a fixed-position portal so they escape every overflow:hidden/auto ancestor */
function DropdownPortal({
  anchorRef,
  open,
  align = "left",
  children,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  open: boolean;
  align?: "left" | "right";
  children: React.ReactNode;
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (open && anchorRef.current) {
      setRect(anchorRef.current.getBoundingClientRect());
    }
  }, [open, anchorRef]);

  // Reposition on scroll / resize while open
  useEffect(() => {
    if (!open) return;
    const update = () => {
      if (anchorRef.current) setRect(anchorRef.current.getBoundingClientRect());
    };
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update, true); window.removeEventListener("resize", update); };
  }, [open, anchorRef]);

  if (!open || !rect) return null;

  const style: React.CSSProperties = {
    position: "fixed",
    top: rect.bottom + 6,
    zIndex: 9999,
    ...(align === "right"
      ? { right: window.innerWidth - rect.right }
      : { left: rect.left }),
  };

  return createPortal(
    <div style={style}>{children}</div>,
    document.body
  );
}

export default function Shop() {
  const { products: stockProducts } = useStock();
  const { getAllCustomProducts } = useSellerProducts();

  const customProducts = getAllCustomProducts();
  const productMap = new Map(stockProducts.map(p => [p.id, p]));
  customProducts.forEach(p => { if (!productMap.has(p.id)) productMap.set(p.id, p); });
  const allProducts = Array.from(productMap.values());
  const categories = ["Semua", ...Array.from(new Set(allProducts.map(p => p.category))).sort()];

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Semua");
  const [sortBy, setSortBy] = useState<SortOption>("default");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [stockOnly, setStockOnly] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const catRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  useOutsideClick(catRef, () => setCatOpen(false));
  useOutsideClick(sortRef, () => setSortOpen(false));
  useOutsideClick(filterRef, () => setFilterOpen(false));

  const activeFilterCount = [
    selectedCategory !== "Semua",
    sortBy !== "default",
    !!minPrice || !!maxPrice,
    stockOnly,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSelectedCategory("Semua");
    setSortBy("default");
    setMinPrice("");
    setMaxPrice("");
    setStockOnly(false);
    setSearchQuery("");
  };

  let filtered = allProducts.filter(p => {
    const q = searchQuery.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    const matchCat = selectedCategory === "Semua" || p.category === selectedCategory;
    const matchMin = !minPrice || p.price >= parseInt(minPrice) * 1000;
    const matchMax = !maxPrice || p.price <= parseInt(maxPrice) * 1000;
    const matchStock = !stockOnly || (p.inStock && (p.stock || 0) > 0);
    return matchSearch && matchCat && matchMin && matchMax && matchStock;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === "price-asc") return a.price - b.price;
    if (sortBy === "price-desc") return b.price - a.price;
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "newest") return parseInt(b.id.replace(/\D/g, "") || "0") - parseInt(a.id.replace(/\D/g, "") || "0");
    return 0;
  });

  const DropButton = ({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children?: React.ReactNode }) => (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all ${active ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600"}`}>
      {label} {children || <ChevronDown className="h-3.5 w-3.5 opacity-60" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-8">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Marketplace</p>
          <h1 className="text-2xl font-bold text-gray-900">Koleksi Knalpot</h1>
          <p className="text-gray-400 text-sm mt-1">{allProducts.length} produk dari pengrajin pilihan</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* ── Filter bar ───────────────────────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 mb-6 shadow-sm space-y-3">
          {/* Search — always full width */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input placeholder="Cari produk..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 border-gray-200 rounded-xl bg-gray-50 focus:bg-white h-10 w-full" />
          </div>

          {/* Dropdown row — scrollable on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-0.5">
            <div className="flex items-center gap-2 flex-nowrap">
              {/* Category dropdown */}
              <div ref={catRef}>
                <DropButton
                  label={selectedCategory === "Semua" ? "Kategori" : selectedCategory}
                  active={selectedCategory !== "Semua"}
                  onClick={() => { setCatOpen(v => !v); setSortOpen(false); setFilterOpen(false); }}
                />
                <DropdownPortal anchorRef={catRef} open={catOpen} align="left">
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 min-w-[160px] max-h-64 overflow-y-auto">
                    {categories.map(cat => (
                      <button key={cat} onClick={() => { setSelectedCategory(cat); setCatOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${selectedCategory === cat ? "text-blue-600 font-semibold bg-blue-50" : "text-gray-700 hover:bg-gray-50"}`}>
                        {cat}
                      </button>
                    ))}
                  </div>
                </DropdownPortal>
              </div>

              {/* Sort dropdown */}
              <div ref={sortRef}>
                <DropButton
                  label={SORT_LABELS[sortBy]}
                  active={sortBy !== "default"}
                  onClick={() => { setSortOpen(v => !v); setCatOpen(false); setFilterOpen(false); }}
                >
                  <ArrowUpDown className="h-3.5 w-3.5 opacity-60" />
                </DropButton>
                <DropdownPortal anchorRef={sortRef} open={sortOpen} align="left">
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 min-w-[180px]">
                    {(Object.keys(SORT_LABELS) as SortOption[]).map(k => (
                      <button key={k} onClick={() => { setSortBy(k); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${sortBy === k ? "text-blue-600 font-semibold bg-blue-50" : "text-gray-700 hover:bg-gray-50"}`}>
                        {k === "rating" && <Star className="h-3.5 w-3.5" />}
                        {k === "newest" && <TrendingUp className="h-3.5 w-3.5" />}
                        {SORT_LABELS[k]}
                      </button>
                    ))}
                  </div>
                </DropdownPortal>
              </div>

              {/* More filters dropdown */}
              <div ref={filterRef}>
                <DropButton
                  label={`Filter${activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}`}
                  active={activeFilterCount > 0}
                  onClick={() => { setFilterOpen(v => !v); setCatOpen(false); setSortOpen(false); }}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5 opacity-70" />
                </DropButton>
                <DropdownPortal anchorRef={filterRef} open={filterOpen} align="right">
                  <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 w-72">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Rentang Harga (×1.000 Rp)</p>
                    <div className="flex items-center gap-2 mb-4">
                      <Input type="number" placeholder="Min" value={minPrice} onChange={e => setMinPrice(e.target.value)}
                        className="rounded-xl border-gray-200 bg-gray-50 text-sm h-9" />
                      <span className="text-gray-400">—</span>
                      <Input type="number" placeholder="Maks" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                        className="rounded-xl border-gray-200 bg-gray-50 text-sm h-9" />
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {[["< 300rb", "", "300"], ["300–400rb", "300", "400"], ["400–500rb", "400", "500"], ["> 500rb", "500", ""]].map(([label, mn, mx]) => (
                        <button key={label} onClick={() => { setMinPrice(mn); setMaxPrice(mx); }}
                          className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all ${minPrice === mn && maxPrice === mx ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-blue-300"}`}>
                          {label}
                        </button>
                      ))}
                    </div>
                    <label className="flex items-center gap-2.5 cursor-pointer mb-4">
                      <input type="checkbox" checked={stockOnly} onChange={e => setStockOnly(e.target.checked)} className="w-4 h-4 accent-blue-600 rounded" />
                      <span className="text-sm text-gray-700 font-medium">Stok tersedia saja</span>
                    </label>
                    <button onClick={() => { setMinPrice(""); setMaxPrice(""); setStockOnly(false); setFilterOpen(false); }}
                      className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors text-center">
                      Reset filter ini
                    </button>
                  </div>
                </DropdownPortal>
              </div>

              {/* Clear all */}
              {activeFilterCount > 0 && (
                <button onClick={resetFilters} className="flex-shrink-0 flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors ml-1">
                  <X className="h-3.5 w-3.5" /> Hapus Semua
                </button>
              )}
            </div>
          </div>

          {/* Active filter chips */}
          {(selectedCategory !== "Semua" || sortBy !== "default" || minPrice || maxPrice || stockOnly) && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <span className="text-xs text-gray-400">Aktif:</span>
              {selectedCategory !== "Semua" && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">{selectedCategory}<button onClick={() => setSelectedCategory("Semua")} className="ml-0.5"><X className="h-2.5 w-2.5" /></button></span>}
              {sortBy !== "default" && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">{SORT_LABELS[sortBy]}<button onClick={() => setSortBy("default")} className="ml-0.5"><X className="h-2.5 w-2.5" /></button></span>}
              {(minPrice || maxPrice) && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">Harga {minPrice ? `≥ ${minPrice}rb` : ""}{minPrice && maxPrice ? " – " : ""}{maxPrice ? `≤ ${maxPrice}rb` : ""}<button onClick={() => { setMinPrice(""); setMaxPrice(""); }} className="ml-0.5"><X className="h-2.5 w-2.5" /></button></span>}
              {stockOnly && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">Stok tersedia<button onClick={() => setStockOnly(false)} className="ml-0.5"><X className="h-2.5 w-2.5" /></button></span>}
            </div>
          )}
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-500 mb-5">
          Menampilkan <span className="font-semibold text-gray-800">{filtered.length}</span> dari {allProducts.length} produk
        </p>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map(product => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center shadow-sm">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Tidak ada produk yang sesuai.</p>
            <button onClick={resetFilters} className="mt-3 text-sm text-blue-600 hover:underline">Reset semua filter</button>
          </div>
        )}
      </div>
    </div>
  );
}
