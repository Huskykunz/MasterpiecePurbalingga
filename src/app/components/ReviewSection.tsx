import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useReviews } from "../context/ReviewContext";
import { StarRating } from "./StarRating";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import { MessageSquare, CheckCircle } from "lucide-react";

interface ReviewSectionProps {
  productId: string;
}

export function ReviewSection({ productId }: ReviewSectionProps) {
  const { isAuthenticated, user } = useAuth();
  const { getProductReviews, addReview, getProductRating } = useReviews();
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const reviews = getProductReviews(productId);
  const { average, count } = getProductRating(productId);

  const handleSubmitReview = () => {
    if (!isAuthenticated || !user) {
      toast.warning("Silakan login untuk memberikan ulasan");
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("Ulasan minimal 10 karakter");
      return;
    }

    addReview({
      productId,
      userId: user.id,
      userName: user.name,
      rating,
      comment: comment.trim(),
    });

    toast.success("Ulasan berhasil ditambahkan!");
    setShowReviewForm(false);
    setComment("");
    setRating(5);
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Ulasan Produk
          </CardTitle>
        </CardHeader>
        <CardContent>
          {count > 0 ? (
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">{average.toFixed(1)}</div>
                <StarRating rating={average} size="md" />
                <p className="text-sm text-gray-500 mt-1">{count} ulasan</p>
              </div>
              <div className="flex-1">
                {[5, 4, 3, 2, 1].map((star) => {
                  const starCount = reviews.filter((r) => r.rating === star).length;
                  const percentage = count > 0 ? (starCount / count) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-2 mb-1">
                      <span className="text-sm w-12">{star} bintang</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-500 w-8">{starCount}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Belum ada ulasan</p>
          )}
        </CardContent>
      </Card>

      {/* Add Review Button */}
      {isAuthenticated && !showReviewForm && (
        <Button onClick={() => setShowReviewForm(true)} className="w-full">
          Tulis Ulasan
        </Button>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle>Tulis Ulasan Anda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rating</label>
              <StarRating
                rating={rating}
                size="lg"
                interactive
                onRatingChange={setRating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Komentar</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Bagikan pengalaman Anda dengan produk ini..."
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSubmitReview} className="flex-1">
                Kirim Ulasan
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowReviewForm(false);
                  setComment("");
                  setRating(5);
                }}
              >
                Batal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{review.userName}</span>
                    {review.verified && (
                      <Badge variant="secondary" className="text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Terverifikasi
                      </Badge>
                    )}
                  </div>
                  <StarRating rating={review.rating} size="sm" />
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(review.date).toLocaleDateString("id-ID")}
                </span>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
