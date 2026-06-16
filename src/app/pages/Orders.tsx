import { Navigate } from "react-router";

// The full order management UI has been moved to /account?tab=orders
export default function Orders() {
  return <Navigate to="/account?tab=orders" replace />;
}
