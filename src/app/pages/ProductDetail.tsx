import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { useStock } from "../context/StockContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useReviews } from "../context/ReviewContext";
import { StarRating } from "../components/StarRating";
import { ReviewSection } from "../components/ReviewSection";
import { ShoppingCart, ArrowLeft, Package, Shield, Check, MessageCircle, Star, Zap, Tag } from "lucide-react";
import { useChat } from "../context/ChatContext";
import { Badge } from "../components/ui/badge";
import { ProductVariation } from "../types";
import { getDiscountedPrice, formatRp } from "../utils/priceUtils";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products } = useStock();   // real-time stock from StockContext
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { getProductRating } = useReviews();
  const { startConversation } = useChat();

  const [isAdding, setIsAdding] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(null);

  // Sellers cannot buy their own products
  const isOwnProduct = !!user && user.role === "craftsman" && user.id === (products.find(p => p.id === id)?.sellerId);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Produk tidak ditemukan</h2>
          <Link to="/shop"><Button>Kembali ke Toko</Button></Link>
        </div>
      </div>
    );
  }

  // ── Price ─────────────────────────────────────────────────────────────────
  const priceInfo = getDiscountedPrice(product);
  const basePrice = priceInfo.hasDiscount ? priceInfo.finalPrice : product.price;
  const displayPrice = selectedVariation
    ? basePrice + (selectedVariation.priceAdjustment || 0)
    : basePrice;

  // ── Gallery ───────────────────────────────────────────────────────────────
  const allImages = [product.image, ...(product.images?.filter(Boolean) || [])];

  // ── Variations grouped by attribute ──────────────────────────────────────
  const variationsByAttr: Record<string, ProductVariation[]> = {};
  (product.variations || []).forEach(v => {
    if (!variationsByAttr[v.attribute]) variationsByAttr[v.attribute] = [];
    variationsByAttr[v.attribute].push(v);
  });

  const { average, count } = getProductRating(product.id);
  const relatedProducts = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleChatSeller = () => {
    if (!isAuthenticated || !user) { navigate("/login"); return; }
    if (!product?.sellerId) return;
    startConversation(user.id, user.name, product.sellerId, product.sellerName || "", product.id, product.name);
    navigate("/account?tab=chat");
  };

  const handleAddToCart = () => {
    if (isAdding) return;
    setIsAdding(true);
    const success = addToCart({ ...product, ...(selectedVariation ? { price: displayPrice } : {}) }, isAuthenticated);
    if (success) {
      setTimeout(() => navigate("/cart"), 600);
    } else {
      setTimeout(() => setIsAdding(false), 1000);
    }
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    navigate("/checkout", { state: { buyNowItems: [{ ...product, price: displayPrice, quantity: 1, selectedVariation }] } });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" /> Kembali
        </button>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">

          {/* ── Image Gallery ── */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 border border-gray-200">
              <img
                src={allImages[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-200"
              />
              {/* Discount badge on image */}
              {priceInfo.hasDiscount && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1.5 rounded-xl shadow">
                  {priceInfo.discountLabel}
                </div>
              )}
              {/* Variation count badge */}
              {(product.variations?.length || 0) > 0 && (
                <div className="absolute top-3 right-3 bg-purple-600 text-white text-xs font-semibold px-2.5 py-1.5 rounded-xl shadow">
                  {product.variations!.length} Variasi
                </div>
              )}
            </div>
            {/* Thumbnails */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {allImages.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? "border-blue-500 shadow-md" : "border-gray-200 hover:border-gray-300"}`}
                  >
                    <img src={img} alt={`foto ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ── */}
          <div className="flex flex-col">
            <Badge variant="secondary" className="w-fit mb-3 bg-blue-50 text-blue-700">{product.category}</Badge>

            <h1 className="text-3xl font-bold text-gray-900 mb-1">{product.name}</h1>

            {/* SKU */}
            {product.sku && (
              <p className="text-xs text-gray-400 font-mono mb-3">SKU: {product.sku}</p>
            )}

            {/* Rating */}
            {count > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={average} size="md" showNumber />
                <span className="text-gray-400 text-sm">({count} ulasan)</span>
              </div>
            )}

            {/* Price */}
            <div className="mb-5">
              {priceInfo.hasDiscount ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-red-600">{formatRp(displayPrice)}</span>
                  <span className="text-lg line-through text-gray-400">{formatRp(product.price + (selectedVariation?.priceAdjustment || 0))}</span>
                  <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-lg">{priceInfo.discountPercent}% OFF</span>
                </div>
              ) : (
                <span className="text-3xl font-bold text-blue-600">{formatRp(displayPrice)}</span>
              )}
              {selectedVariation && selectedVariation.priceAdjustment !== 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Harga dasar {formatRp(basePrice)} {selectedVariation.priceAdjustment > 0 ? `+ ${formatRp(selectedVariation.priceAdjustment)}` : `- ${formatRp(Math.abs(selectedVariation.priceAdjustment))}`} (variasi)
                </p>
              )}
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-6 leading-relaxed text-sm">{product.description}</p>

            {/* ── Variation Selector ── */}
            {Object.keys(variationsByAttr).length > 0 && (
              <div className="mb-6 space-y-4">
                {Object.entries(variationsByAttr).map(([attr, vars]) => (
                  <div key={attr}>
                    <p className="text-sm font-semibold text-gray-700 mb-2">{attr}:</p>
                    <div className="flex flex-wrap gap-2">
                      {vars.map(v => {
                        const isSelected = selectedVariation?.id === v.id;
                        const outOfStock = v.stock === 0;
                        return (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVariation(isSelected ? null : v)}
                            disabled={outOfStock}
                            className={`relative px-3 py-1.5 rounded-xl text-sm font-medium border-2 transition-all ${
                              outOfStock ? "border-gray-100 text-gray-300 bg-gray-50 cursor-not-allowed" :
                              isSelected ? "border-blue-600 bg-blue-600 text-white shadow-md" :
                              "border-gray-200 text-gray-700 hover:border-blue-400 hover:bg-blue-50"
                            }`}
                          >
                            {v.name}
                            {v.priceAdjustment !== 0 && !outOfStock && (
                              <span className={`ml-1 text-xs ${isSelected ? "text-blue-100" : "text-gray-400"}`}>
                                {v.priceAdjustment > 0 ? `+${formatRp(v.priceAdjustment)}` : `-${formatRp(Math.abs(v.priceAdjustment))}`}
                              </span>
                            )}
                            {outOfStock && <span className="ml-1 text-[10px]">(habis)</span>}
                          </button>
                        );
                      })}
                    </div>
                    {selectedVariation && variationsByAttr[attr].some(v => v.id === selectedVariation.id) && (
                      <p className="text-xs text-gray-400 mt-1.5">
                        Stok tersedia: <span className="font-semibold text-gray-700">{selectedVariation.stock} unit</span>
                        {selectedVariation.sku && <span className="ml-2 font-mono">· {selectedVariation.sku}</span>}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Seller info */}
            {product.sellerName && (
              <div className="flex items-center gap-3 mb-5 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {product.sellerName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{product.sellerName}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>Penjual Terverifikasi</span>
                  </div>
                </div>
                <button onClick={handleChatSeller} className="text-xs text-blue-600 border border-blue-200 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors flex-shrink-0">
                  Chat
                </button>
              </div>
            )}

            {/* Features */}
            <div className="flex gap-4 mb-6 text-sm text-gray-500">
              <div className="flex items-center gap-1.5"><Package className="h-4 w-4 text-blue-500" /> Handcrafted</div>
              <div className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-blue-500" /> Bergaransi</div>
            </div>

            {/* Stock */}
            <div className="mb-6">
              {product.inStock ? (
                <span className="inline-flex items-center gap-1.5 text-green-700 bg-green-50 border border-green-100 px-3 py-1 rounded-full text-sm font-medium">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Stok Tersedia
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 border border-red-100 px-3 py-1 rounded-full text-sm font-medium">
                  Stok Habis
                </span>
              )}
            </div>

            {/* CTA Buttons */}
            {isOwnProduct ? (
              <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <Tag className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Ini produk Anda sendiri</p>
                  <p className="text-xs text-amber-600 mt-0.5">Penjual tidak dapat membeli produk miliknya sendiri.</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 h-12 rounded-xl"
                  onClick={handleAddToCart}
                  disabled={!product.inStock || isAdding}
                >
                  {isAdding ? <><Check className="mr-2 h-5 w-5" />Ditambahkan</> : <><ShoppingCart className="mr-2 h-5 w-5" />Keranjang</>}
                </Button>
                <button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold flex items-center justify-center gap-2 disabled:opacity-40 shadow-lg shadow-orange-200 hover:shadow-xl transition-all hover:-translate-y-0.5"
                >
                  <Zap className="h-5 w-5" /> Beli Sekarang
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reviews */}
        <div className="mb-16">
          <ReviewSection productId={product.id} />
        </div>

        {/* Related */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Produk Terkait</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map(p => {
                const rel = getDiscountedPrice(p);
                return (
                  <Link key={p.id} to={`/product/${p.id}`} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative aspect-square">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      {rel.hasDiscount && <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">DISKON</span>}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors">{p.name}</p>
                      {rel.hasDiscount ? (
                        <div className="mt-1">
                          <p className="text-sm font-bold text-red-600">{formatRp(rel.finalPrice)}</p>
                          <p className="text-xs line-through text-gray-400">{formatRp(p.price)}</p>
                        </div>
                      ) : (
                        <p className="text-sm font-bold text-blue-600 mt-1">{formatRp(p.price)}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
