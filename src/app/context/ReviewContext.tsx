import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { Review } from "../types";

interface ReviewContextType {
  reviews: Review[];
  getProductReviews: (productId: string) => Review[];
  getSellerReviews: (productIds: string[]) => Review[];
  getProductRating: (productId: string) => { average: number; count: number };
  addReview: (review: Omit<Review, "id" | "date" | "verified">) => void;
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

  const getProductReviews = (productId: string) => {
    return reviews.filter((review) => review.productId === productId);
  };

  const getSellerReviews = (productIds: string[]) => {
    return reviews.filter((r) => productIds.includes(r.productId));
  };

  const getProductRating = (productId: string) => {
    const productReviews = getProductReviews(productId);
    if (productReviews.length === 0) {
      return { average: 0, count: 0 };
    }
    const sum = productReviews.reduce((acc, review) => acc + review.rating, 0);
    return {
      average: sum / productReviews.length,
      count: productReviews.length,
    };
  };

  const addReview = (review: Omit<Review, "id" | "date" | "verified">) => {
    const newReview: Review = {
      ...review,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      verified: true,
    };
    setReviews((prev) => [newReview, ...prev]);
  };

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        getProductReviews,
        getSellerReviews,
        getProductRating,
        addReview,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewContext);
  if (context === undefined) {
    throw new Error("useReviews must be used within a ReviewProvider");
  }
  return context;
}
