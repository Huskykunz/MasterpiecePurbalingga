import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Orders from "./pages/Orders";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Complaint from "./pages/Complaint";
import Complaints from "./pages/Complaints";
import AdminDashboard from "./pages/AdminDashboard";
import CraftsmanDashboard from "./pages/CraftsmanDashboard";
import DesignVisualizer from "./pages/AIVisualizer";
import SellerSignup from "./pages/SellerSignup";
import AccountPage from "./pages/AccountPage";
import NotFound from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "shop", Component: Shop },
      { path: "product/:id", Component: ProductDetail },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "order-confirmation/:orderId", Component: OrderConfirmation },
      { path: "orders", Component: Orders },
      { path: "about", Component: About },
      { path: "contact", Component: Contact },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "profile", Component: Profile },
      { path: "account", Component: AccountPage },
      { path: "complaint", Component: Complaint },
      { path: "complaints", Component: Complaints },
      { path: "ai-visualizer", Component: DesignVisualizer },
      { path: "seller-signup", Component: SellerSignup },
      { path: "admin", Component: AdminDashboard },
      { path: "craftsman", Component: CraftsmanDashboard },
      { path: "*", Component: NotFound },
    ],
  },
]);
