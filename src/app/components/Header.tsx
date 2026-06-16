import { Link, useNavigate, useLocation } from "react-router";
import {
  ShoppingCart, Store, Menu, X, User, LogOut,
  Package, Briefcase, ChevronDown, MessageCircle,
  RotateCcw, Info, Phone, Sparkles
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";

export function Header() {
  const { getItemCount } = useCart();
  const { isAuthenticated, logout, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);
  const [infoDropOpen, setInfoDropOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserDropOpen(false);
      if (infoRef.current && !infoRef.current.contains(e.target as Node)) setInfoDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setUserDropOpen(false);
    toast.success("Berhasil keluar");
    navigate("/");
  };

  const isActive = (path: string) =>
    location.pathname === path
      ? "text-white font-medium"
      : "text-gray-400 hover:text-white";

  return (
    <header className="w-full bg-[#111318] border-b border-white/5 shadow-lg sticky top-0 z-50">
      {/* Three-column grid so nav is always perfectly centered */}
      <div className="container mx-auto grid grid-cols-[1fr_auto_1fr] h-14 items-center px-4 gap-4">

        {/* Logo — left column */}
        <Link to="/" className="flex items-center gap-2.5 justify-self-start">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-md flex-shrink-0">
            <Store className="h-4 w-4 text-white" />
          </div>
          <span className="text-white font-semibold text-sm tracking-wide hidden sm:block">
            Masterpiece <span className="text-blue-400">Purbalingga</span>
          </span>
          <span className="text-white font-bold text-sm sm:hidden">MP</span>
        </Link>

        {/* Desktop nav — center column, truly centered */}
        <nav className="hidden md:flex items-center gap-1">
          <Link to="/" className={`px-3 py-1.5 rounded-md text-sm transition-colors ${isActive("/")}`}>
            Beranda
          </Link>
          <Link to="/shop" className={`px-3 py-1.5 rounded-md text-sm transition-colors ${isActive("/shop")}`}>
            Toko
          </Link>
          <Link to="/ai-visualizer" className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-1.5 ${isActive("/ai-visualizer")}`}>
            <Sparkles className="h-3.5 w-3.5" />
            Visualisasi AI
            <span className="text-[10px] bg-amber-400/90 text-black px-1.5 py-0.5 rounded-full font-bold leading-none tracking-wide">BARU</span>
          </Link>

          {/* Info dropdown */}
          <div className="relative" ref={infoRef}>
            <button
              onClick={() => setInfoDropOpen((v) => !v)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors ${infoDropOpen ? "text-white" : "text-gray-400 hover:text-white"}`}
            >
              Info <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${infoDropOpen ? "rotate-180" : ""}`} />
            </button>
            {infoDropOpen && (
              <div className="absolute top-full mt-2 left-0 bg-[#1c1f27] border border-white/10 rounded-xl shadow-2xl py-1.5 w-40 z-50">
                <Link to="/about" onClick={() => setInfoDropOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                  <Info className="h-3.5 w-3.5 text-gray-500" /> Tentang
                </Link>
                <Link to="/contact" onClick={() => setInfoDropOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                  <Phone className="h-3.5 w-3.5 text-gray-500" /> Kontak
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Right side — right column */}
        <div className="flex items-center gap-1.5 justify-self-end">
          {/* Cart */}
          <Link to="/cart" className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <ShoppingCart className="h-5 w-5" />
            {getItemCount() > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center leading-none">
                {getItemCount()}
              </span>
            )}
          </Link>

          {/* User dropdown */}
          {isAuthenticated && user ? (
            <div className="relative hidden md:block" ref={userRef}>
              <button
                onClick={() => setUserDropOpen((v) => !v)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-sm ${userDropOpen ? "bg-white/10 border-white/20 text-white" : "border-white/10 text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/20"}`}
              >
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[80px] truncate">{user.name}</span>
                <ChevronDown className={`h-3.5 w-3.5 text-gray-500 transition-transform duration-200 ${userDropOpen ? "rotate-180" : ""}`} />
              </button>

              {userDropOpen && (
                <div className="absolute top-full mt-2 right-0 bg-[#1c1f27] border border-white/10 rounded-xl shadow-2xl py-1.5 w-52 z-50">
                  <div className="px-4 py-2.5 border-b border-white/10">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user.role === "craftsman" ? "Penjual" : "Pembeli"}</p>
                  </div>

                  {[
                    { to: "/account", label: "Akun Saya", icon: User },
                    { to: "/account?tab=orders", label: "Pesanan", icon: Package },
                    { to: "/account?tab=chat", label: "Chat", icon: MessageCircle },
                    { to: "/account?tab=returns", label: "Pengembalian", icon: RotateCcw },
                  ].map(({ to, label, icon: Icon }) => (
                    <Link key={to} to={to} onClick={() => setUserDropOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                      <Icon className="h-4 w-4 text-gray-500" /> {label}
                    </Link>
                  ))}

                  <div className="border-t border-white/10 mt-1 pt-1">
                    {user.role !== "craftsman" && (
                      <Link to="/seller-signup" onClick={() => setUserDropOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-blue-400 hover:text-blue-300 hover:bg-white/5 transition-colors">
                        <Briefcase className="h-4 w-4" /> Jual di Sini
                      </Link>
                    )}
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors w-full text-left">
                      <LogOut className="h-4 w-4" /> Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
            >
              <User className="h-3.5 w-3.5" /> Masuk
            </Link>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#15181f]">
          <div className="container mx-auto px-4 py-3 flex flex-col gap-0.5">
            {[
              { to: "/", label: "Beranda" },
              { to: "/shop", label: "Toko" },
              { to: "/ai-visualizer", label: "Visualisasi AI" },
              { to: "/about", label: "Tentang" },
              { to: "/contact", label: "Kontak" },
            ].map(({ to, label }) => (
              <Link key={to} to={to} className={`px-3 py-2.5 rounded-lg text-sm transition-colors ${location.pathname === to ? "bg-white/10 text-white" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                {label}
              </Link>
            ))}

            <div className="border-t border-white/10 mt-2 pt-2 space-y-0.5">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 mb-1">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{user.name}</p>
                      <p className="text-gray-500 text-xs">{user.role === "craftsman" ? "Penjual" : "Pembeli"}</p>
                    </div>
                  </div>
                  {[
                    { to: "/account", label: "Akun Saya", icon: User },
                    { to: "/account?tab=orders", label: "Pesanan", icon: Package },
                    { to: "/account?tab=chat", label: "Chat", icon: MessageCircle },
                    { to: "/account?tab=returns", label: "Pengembalian", icon: RotateCcw },
                    ...(user.role !== "craftsman" ? [{ to: "/seller-signup", label: "Jual di Sini", icon: Briefcase }] : []),
                  ].map(({ to, label, icon: Icon }) => (
                    <Link key={to} to={to} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
                      <Icon className="h-4 w-4" /> {label}
                    </Link>
                  ))}
                  <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-white/5 w-full transition-colors">
                    <LogOut className="h-4 w-4" /> Keluar
                  </button>
                </>
              ) : (
                <Link to="/login" className="flex items-center justify-center gap-2 mx-3 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors">
                  <User className="h-4 w-4" /> Masuk / Daftar
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
