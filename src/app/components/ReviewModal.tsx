import { useState } from "react";
import { Star, X, ShieldCheck } from "lucide-react";
import { useReviews } from "../context/ReviewContext";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";
import { toast } from "sonner";

interface Props {
  productId: string;
  productName: string;
  onClose: () => void;
}

export function ReviewModal({ productId, productName, onClose }: Props) {
  const { addReview, getProductReviews } = useReviews();
  const { user } = useAuth();
  const { getUserOrders } = useOrders();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const alreadyReviewed = user
    ? getProductReviews(productId).some(r => r.userId === user.id)
    : false;

  // Find user's delivered orders to pass to addReview for verification
  const deliveredOrders = user
    ? getUserOrders(user.id).filter(o => o.status === "delivered")
    : [];

  const isVerifiedPurchase = deliveredOrders.some(o =>
    o.items.some(i => i.id === productId)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!comment.trim()) { toast.error("Tuliskan ulasan Anda"); return; }
    setSubmitting(true);
    addReview({ productId, userId: user.id, userName: user.name, rating, comment }, deliveredOrders);
    toast.success("Ulasan berhasil dikirim!");
    onClose();
  };

  if (alreadyReviewed) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="h-6 w-6 text-green-500 fill-green-400" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Sudah Diulas</h3>
          <p className="text-gray-500 text-sm mb-4">Anda sudah memberikan ulasan untuk produk ini.</p>
          <button onClick={onClose} className="bg-gray-100 text-gray-700 px-5 py-2 rounded-xl text-sm hover:bg-gray-200">Tutup</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Beri Ulasan</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <p className="text-sm text-gray-500 mb-1">Produk</p>
            <p className="font-medium text-gray-900 text-sm">{productName}</p>
            {isVerifiedPurchase ? (
              <div className="flex items-center gap-1.5 mt-1.5 text-green-600">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Pembelian Terverifikasi</span>
              </div>
            ) : (
              <p className="text-xs text-amber-600 mt-1.5">⚠ Ulasan tidak terverifikasi — produk belum pernah dibeli</p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-700 font-medium mb-2">Rating</p>
            <div className="flex gap-1">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button"
                  onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(s)} className="transition-transform hover:scale-110">
                  <Star className={`h-8 w-8 ${(hover || rating) >= s ? "fill-amber-400 text-amber-400" : "text-gray-200 fill-gray-100"}`} />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500 self-center">
                {["","Sangat Buruk","Buruk","Cukup","Bagus","Sangat Bagus"][hover || rating]}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700 font-medium block mb-1.5">Ulasan</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Bagikan pengalaman Anda dengan produk ini..."
              rows={4} required
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-blue-400 bg-gray-50 focus:bg-white" />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50">Batal</button>
            <button type="submit" disabled={submitting} className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm hover:bg-blue-500 font-medium">
              {submitting ? "Mengirim..." : "Kirim Ulasan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
