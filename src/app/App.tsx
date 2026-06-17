// MARKER-MAKE-KIT-INVOKED
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { OrderProvider } from "./context/OrderContext";
import { ReviewProvider } from "./context/ReviewContext";
import { ComplaintProvider } from "./context/ComplaintContext";
import { ChatProvider } from "./context/ChatContext";
import { RestockProvider } from "./context/RestockContext";
import { ReturnProvider } from "./context/ReturnContext";
import { StockProvider } from "./context/StockContext";
import { SellerProductProvider } from "./context/SellerProductContext";
import { AddressProvider } from "./context/AddressContext";
import { CouponProvider } from "./context/CouponContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";
import { router } from "./routes";
import { useEffect } from "react";
import { initializeSellers } from "./data/sellers";

function AppInit({ children }: { children: React.ReactNode }) {
  useEffect(() => { initializeSellers(); }, []);
  return <>{children}</>;
}

export default function App() {
  return (
    <SubscriptionProvider>
    <CouponProvider>
    <AddressProvider>
    <AuthProvider>
      <OrderProvider>
        <ReviewProvider>
          <ComplaintProvider>
            <CartProvider>
              <SellerProductProvider>
              <StockProvider>
              <ChatProvider>
                <RestockProvider>
                  <ReturnProvider>
                    <AppInit>
                      <RouterProvider router={router} />
                      <Toaster
                        position="top-right"
                        richColors
                        closeButton
                        expand={false}
                      />
                    </AppInit>
                  </ReturnProvider>
                </RestockProvider>
              </ChatProvider>
              </StockProvider>
              </SellerProductProvider>
            </CartProvider>
          </ComplaintProvider>
        </ReviewProvider>
      </OrderProvider>
    </AuthProvider>
    </AddressProvider>
    </CouponProvider>
    </SubscriptionProvider>
  );
}
