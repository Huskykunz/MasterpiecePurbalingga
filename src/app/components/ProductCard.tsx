import { Link } from "react-router";
import { useState } from "react";
import { Product } from "../types";
import { Button } from "./ui/button";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useReviews } from "../context/ReviewContext";
import { StarRating } from "./StarRating";
import { ShoppingCart, Check } from "lucide-react";
import { Badge } from "./ui/badge";

interface ProductCardProps {
  product: Product;
  dark?: boolean;
}

export function ProductCard({ product, dark = false }: ProductCardProps) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { getProductRating } = useReviews();
  const { average, count } = getProductRating(product.id);
  const [isAdding, setIsAdding] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(price);

  const handleAddToCart = () => {
    if (isAdding) return;
    setIsAdding(true);
    addToCart(product, isAuthenticated);
    setTimeout(() => setIsAdding(false), 1000);
  };

  if (dark) {
    return (
      <div className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden hover:bg-white/8 hover:-translate-y-1.5 hover:border-white/20 transition-all duration-300 flex flex-col">
        <Link to={`/product/${product.id}`}>
          <div className="aspect-square overflow-hidden relative">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                <span className="text-white text-sm font-semibold bg-red-500/80 px-3 py-1 rounded-full">Stok Habis</span>
              </div>
            )}
            <span className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm border border-white/10 text-white text-[10px] px-2 py-1 rounded-lg">
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
            <div className="flex items-center gap-1.5 mb-2">
              <StarRating rating={average} size="sm" />
              <span className="text-xs text-gray-500">({count})</span>
            </div>
          )}
          <p className="text-amber-400 font-bold mt-auto pt-2">{formatPrice(product.price)}</p>
          {product.sellerName && (
            <p className="text-[11px] text-gray-600 mt-1 truncate">🏪 {product.sellerName}</p>
          )}
          <Button
            className="w-full mt-3 bg-blue-600 hover:bg-blue-500 text-white text-sm h-9"
            onClick={handleAddToCart}
            disabled={!product.inStock || isAdding}
          >
            {isAdding ? <><Check className="h-3.5 w-3.5 mr-1.5" />Ditambahkan</> : <><ShoppingCart className="h-3.5 w-3.5 mr-1.5" />Keranjang</>}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-square overflow-hidden bg-gray-50 relative">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white text-sm font-semibold bg-red-500/80 px-3 py-1 rounded-full">Stok Habis</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4 flex flex-col flex-1">
        <Badge variant="secondary" className="mb-2 w-fit bg-blue-50 text-blue-700 text-[11px]">
          {product.category}
        </Badge>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-semibold text-sm mb-1 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
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
        <p className="font-bold text-blue-600 mt-auto">{formatPrice(product.price)}</p>
        {product.stock !== undefined && product.inStock && (
          <p className="text-[11px] text-gray-400 mt-0.5">Stok: {product.stock} unit</p>
        )}
        {product.sellerName && (
          <p className="text-[11px] text-gray-400 mt-0.5 truncate">🏪 {product.sellerName}</p>
        )}
        <Button
          className="w-full mt-3 bg-blue-600 hover:bg-blue-500 text-white text-sm h-9"
          onClick={handleAddToCart}
          disabled={!product.inStock || isAdding}
        >
          {isAdding ? <><Check className="h-3.5 w-3.5 mr-1.5" />Ditambahkan</> : <><ShoppingCart className="h-3.5 w-3.5 mr-1.5" />Keranjang</>}
        </Button>
      </div>
    </div>
  );
}
