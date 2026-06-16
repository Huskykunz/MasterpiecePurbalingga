import { Link, useNavigate } from "react-router";
import { useState } from "react";
import { Product } from "../types";
import { Button } from "./ui/button";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useReviews } from "../context/ReviewContext";
import { StarRating } from "./StarRating";
import { ShoppingCart, Check, Zap, Layers } from "lucide-react";
import { Badge } from "./ui/badge";
import { getDiscountedPrice, formatRp } from "../utils/priceUtils";

interface ProductCardProps {
  product: Product;
  dark?: boolean;
}

export function ProductCard({ product, dark = false }: ProductCardProps) {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { getProductRating } = useReviews();
  const { average, count } = getProductRating(product.id);
  const [isAdding, setIsAdding] = useState(false);

  const { finalPrice, originalPrice, hasDiscount, discountLabel, discountPercent } = getDiscountedPrice(product);
  const variationCount = product.variations?.length || 0;

  // Sellers cannot buy their own products
  const isOwnProduct = !!user && user.role === "craftsman" && user.id === product.sellerId;

  const handleAddToCart = () => {
    if (isAdding) return;
    setIsAdding(true);
    addToCart(product, isAuthenticated);
    setTimeout(() => setIsAdding(false), 1000);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    navigate("/checkout", { state: { buyNowItems: [{ ...product, quantity: 1 }] } });
  };

  if (dark) {
    return (
      <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/8 hover:-translate-y-1.5 hover:border-white/20 transition-all duration-300 flex flex-col">
        <Link to={`/product/${product.id}`}>
          <div className="aspect-square overflow-hidden relative">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-sm font-semibold bg-red-500/80 px-3 py-1 rounded-full">Stok Habis</span>
              </div>
            )}
            {/* Discount badge */}
            {hasDiscount && (
              <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow">
                {discountPercent}% OFF
              </span>
            )}
            {/* Category */}
            <span className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm border border-white/10 text-white text-[10px] px-2 py-1 rounded-lg">
              {product.category}
            </span>
          </div>
        </Link>
        <div className="p-4 flex flex-col flex-1">
          <Link to={`/product/${product.id}`}>
            <h3 className="text-white text-sm font-semibold mb-1 line-clamp-2 group-hover:text-blue-300 transition-colors leading-snug">
              {product.name}
            </h3>
          </Link>
          {count > 0 && (
            <div className="flex items-center gap-1.5 mb-1">
              <StarRating rating={average} size="sm" />
              <span className="text-xs text-gray-500">({count})</span>
            </div>
          )}
          {/* Variation badge */}
          {variationCount > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <Layers className="h-3 w-3 text-purple-400" />
              <span className="text-[10px] text-purple-300">{variationCount} Variasi Tersedia</span>
            </div>
          )}
          {/* Price */}
          <div className="mt-auto pt-2">
            {hasDiscount ? (
              <>
                <p className="text-amber-400 font-bold">{formatRp(finalPrice)}</p>
                <p className="text-xs line-through text-gray-500">{formatRp(originalPrice)}</p>
              </>
            ) : (
              <p className="text-amber-400 font-bold">{formatRp(product.price)}</p>
            )}
          </div>
          {product.sellerName && (
            <p className="text-[11px] text-gray-600 mt-1 truncate">🏪 {product.sellerName}</p>
          )}
          {/* Buttons */}
          {isOwnProduct ? (
            <div className="mt-3 text-center text-xs text-gray-500 bg-white/5 border border-white/10 rounded-lg py-2">
              Produk milik Anda
            </div>
          ) : (
            <div className="flex gap-2 mt-3">
              <Button
                className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs h-9"
                onClick={handleAddToCart}
                disabled={!product.inStock || isAdding}
              >
                {isAdding ? <><Check className="h-3 w-3 mr-1" />OK</> : <><ShoppingCart className="h-3 w-3 mr-1" />Keranjang</>}
              </Button>
              <button
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-40 text-white text-xs font-semibold h-9 rounded-lg flex items-center justify-center gap-1 transition-all hover:shadow-md hover:shadow-orange-500/30"
              >
                <Zap className="h-3 w-3" /> Beli
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-gray-50 relative">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-sm font-semibold bg-red-500/80 px-3 py-1 rounded-full">Stok Habis</span>
            </div>
          )}
          {/* Discount badge on image */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md">
              {discountLabel}
            </div>
          )}
          {/* Variation badge on image */}
          {variationCount > 0 && (
            <div className="absolute top-2 right-2 bg-purple-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1">
              <Layers className="h-2.5 w-2.5" />{variationCount} Variasi
            </div>
          )}
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <Badge variant="secondary" className="mb-2 w-fit bg-blue-50 text-blue-700 text-[11px]">
          {product.category}
        </Badge>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-sm mb-1 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug text-gray-900">
            {product.name}
          </h3>
        </Link>
        {count > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <StarRating rating={average} size="sm" />
            <span className="text-xs text-gray-400">({count})</span>
          </div>
        )}
        <p className="text-sm text-gray-500 mb-3 line-clamp-2 leading-relaxed">{product.description}</p>

        {/* Price — with or without discount */}
        <div className="mt-auto">
          {hasDiscount ? (
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-red-600">{formatRp(finalPrice)}</span>
              <span className="text-xs line-through text-gray-400">{formatRp(originalPrice)}</span>
              <span className="text-[10px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded">-{discountPercent}%</span>
            </div>
          ) : (
            <span className="font-bold text-blue-600">{formatRp(product.price)}</span>
          )}
        </div>

        {product.stock !== undefined && product.inStock && (
          <p className="text-[11px] text-gray-400 mt-0.5">Stok: {product.stock} unit</p>
        )}
        {product.sellerName && (
          <p className="text-[11px] text-gray-400 mt-0.5 truncate">🏪 {product.sellerName}</p>
        )}
        {product.sku && (
          <p className="text-[10px] text-gray-300 mt-0.5 font-mono">{product.sku}</p>
        )}

        {/* Action buttons */}
        {isOwnProduct ? (
          <div className="mt-3 text-center text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-xl py-2.5">
            Produk milik Anda
          </div>
        ) : (
          <div className="flex gap-2 mt-3">
            <Button
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs h-9"
              onClick={handleAddToCart}
              disabled={!product.inStock || isAdding}
            >
              {isAdding
                ? <><Check className="h-3.5 w-3.5 mr-1" />Ditambahkan</>
                : <><ShoppingCart className="h-3.5 w-3.5 mr-1" />Keranjang</>}
            </Button>
            <button
              onClick={handleBuyNow}
              disabled={!product.inStock}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-40 text-white text-xs font-bold h-9 rounded-lg flex items-center justify-center gap-1.5 transition-all hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Zap className="h-3.5 w-3.5" /> Beli Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
