import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { products } from "../data/products";
import { Button } from "../components/ui/button";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useReviews } from "../context/ReviewContext";
import { StarRating } from "../components/StarRating";
import { ReviewSection } from "../components/ReviewSection";
import { ShoppingCart, ArrowLeft, Package, Shield, Check, MessageCircle, Star } from "lucide-react";
import { useChat } from "../context/ChatContext";
import { Badge } from "../components/ui/badge";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();
  const { getProductRating } = useReviews();
  const { startConversation } = useChat();
  const [isAdding, setIsAdding] = useState(false);

  const handleChatSeller = () => {
    if (!isAuthenticated || !user) { navigate("/login"); return; }
    if (!product?.sellerId) return;
    startConversation(user.id, user.name, product.sellerId, product.sellerName || "", product.id, product.name);
    navigate("/account?tab=chat");
  };

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl mb-4">Product not found</h2>
          <Link to="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = () => {
    if (isAdding) return; // Prevent multiple clicks

    setIsAdding(true);
    const success = addToCart(product, isAuthenticated);

    if (success) {
      // Navigate to cart after a brief delay to show the "Added" state
      setTimeout(() => {
        navigate("/cart");
      }, 600);
    } else {
      // Re-enable button if add to cart failed (e.g., not authenticated)
      setTimeout(() => {
        setIsAdding(false);
      }, 1000);
    }
  };

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const { average, count } = getProductRating(product.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image */}
          <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <Badge variant="secondary" className="w-fit mb-4">
              {product.category}
            </Badge>
            <h1 className="text-4xl mb-4">{product.name}</h1>
            {count > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={average} size="md" showNumber />
                <span className="text-gray-500">({count} ulasan)</span>
              </div>
            )}
            <p className="text-3xl font-semibold text-blue-600 mb-6">
              {formatPrice(product.price)}
            </p>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Seller info */}
            {product.sellerName && (
              <div className="flex items-center gap-3 mb-5 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {product.sellerName.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{product.sellerName}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>Penjual Terverifikasi</span>
                  </div>
                </div>
                <button onClick={handleChatSeller} className="text-xs text-blue-600 border border-blue-600 px-2 py-1 rounded hover:bg-orange-50">
                  Chat
                </button>
              </div>
            )}

            {/* Features */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-blue-600" />
                <span className="text-sm">Handcrafted with care</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-blue-600" />
                <span className="text-sm">Quality guaranteed</span>
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-6">
              {product.inStock ? (
                <p className="text-green-600 font-medium">Tersedia</p>
              ) : (
                <p className="text-red-600 font-medium">Stok Habis</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                size="lg"
                className="flex-1"
                onClick={handleAddToCart}
                disabled={!product.inStock || isAdding}
              >
                {isAdding ? (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    Ditambahkan
                  </>
                ) : (
                  <>
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Tambah ke Keranjang
                  </>
                )}
              </Button>
              <Button size="lg" variant="outline" className="flex-1" onClick={handleChatSeller}>
                <MessageCircle className="mr-2 h-5 w-5" />
                Chat Penjual
              </Button>
            </div>
          </div>
        </div>

        {/* Review Section */}
        <div className="mb-16">
          <ReviewSection productId={product.id} />
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl mb-6">Produk Terkait</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  to={`/product/${relatedProduct.id}`}
                  className="group"
                >
                  <div className="aspect-square overflow-hidden rounded-lg mb-3">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="font-semibold mb-1 group-hover:text-blue-600 transition-colors">
                    {relatedProduct.name}
                  </h3>
                  <p className="font-semibold text-blue-600">
                    {formatPrice(relatedProduct.price)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
