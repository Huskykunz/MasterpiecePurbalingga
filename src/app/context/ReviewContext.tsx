import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Review } from "../types";

// Orders injected by the component calling addReview so we can verify purchase
// without a circular context dependency.
interface ReviewContextType {
  reviews: Review[];
  getProductReviews: (productId: string) => Review[];
  getSellerReviews: (productIds: string[]) => Review[];
  getProductRating: (productId: string) => { average: number; count: number };
  /**
   * Pass `deliveredOrders` (orders of the current user with status "delivered")
   * so the context can check whether the user actually bought this product.
   * verified = true only if a delivered order contains the productId.
   */
  addReview: (
    review: Omit<Review, "id" | "date" | "verified">,
    deliveredOrders?: { items: { id: string }[] }[]
  ) => void;
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined);

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem("reviews");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("reviews", JSON.stringify(reviews));
  }, [reviews]);

  const getProductReviews = (productId: string) =>
    reviews.filter(r => r.productId === productId);

  const getSellerReviews = (productIds: string[]) =>
    reviews.filter(r => productIds.includes(r.productId));

  const getProductRating = (productId: string) => {
    const pr = getProductReviews(productId);
    if (pr.length === 0) return { average: 0, count: 0 };
    const sum = pr.reduce((acc, r) => acc + r.rating, 0);
    return { average: sum / pr.length, count: pr.length };
  };

  const addReview = (
    review: Omit<Review, "id" | "date" | "verified">,
    deliveredOrders: { items: { id: string }[] }[] = []
  ) => {
    // Check duplicate — one review per user per product
    const alreadyReviewed = reviews.some(
      r => r.productId === review.productId && r.userId === review.userId
    );
    if (alreadyReviewed) return;

    // Verified purchase: user must have a delivered order containing this product
    const isVerified = deliveredOrders.some(order =>
      order.items.some(item => item.id === review.productId)
    );

    const newReview: Review = {
      ...review,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      verified: isVerified,
    };
    setReviews(prev => [newReview, ...prev]);
  };

  return (
    <ReviewContext.Provider value={{ reviews, getProductReviews, getSellerReviews, getProductRating, addReview }}>
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error("useReviews must be used within a ReviewProvider");
  return ctx;
}
