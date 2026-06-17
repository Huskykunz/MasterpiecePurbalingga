import { Navigate, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useSubscription, SubscriptionPlan } from "../context/SubscriptionContext";
import { toast } from "sonner";
import { Check, Shield, Package, Zap, ArrowLeft, CalendarDays } from "lucide-react";

const fmt = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

const PLANS: {
  id: SubscriptionPlan;
  name: string;
  price: number;
  border: string;
  activeBorder: string;
  badge: string | null;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  features: string[];
}[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    border: "border-gray-200",
    activeBorder: "border-blue-500",
    badge: null,
    icon: Package,
    iconBg: "bg-gray-100",
    iconColor: "text-gray-500",
    features: [
      "Produk tidak masuk seksi Unggulan",
      "Urutan standar di halaman Toko",
      "Tanpa badge langganan",
      "Semua fitur dasar penjual",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    price: 50_000,
    border: "border-gray-300",
    activeBorder: "border-blue-500",
    badge: "Silver",
    icon: Shield,
    iconBg: "bg-gray-200",
    iconColor: "text-gray-600",
    features: [
      "Produk tampil di seksi Unggulan",
      "Prioritas lebih tinggi di halaman Toko",
      "Badge \"Silver\" di kartu produk",
      "Semua fitur paket Free",
    ],
  },
];

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { getSellerPlan, getSellerExpiry, upgradePlan, cancelPlan } = useSubscription();

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.role !== "craftsman") return <Navigate to="/" replace />;

  const currentPlan = getSellerPlan(user.id);
  const expiry = getSellerExpiry(user.id);
  const expiryStr = expiry && currentPlan !== "free"
    ? new Date(expiry).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })
    : null;

  const handleUpgrade = (plan: SubscriptionPlan) => {
    if (plan === currentPlan) return;
    if (plan === "free") {
      cancelPlan(user.id);
      toast.success("Langganan dibatalkan — beralih ke Free");
    } else {
      upgradePlan(user.id, plan);
      toast.success(`Paket ${plan.charAt(0).toUpperCase() + plan.slice(1)} berhasil diaktifkan!`, {
        description: "Aktif selama 30 hari ke depan",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-6 max-w-3xl flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kelola Langganan</h1>
            <p className="text-gray-400 text-sm mt-0.5">Tingkatkan visibilitas produk Anda</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Active plan banner */}
        {currentPlan !== "free" && expiryStr && (
          <div className="mb-8 flex items-center gap-3 p-4 rounded-2xl border bg-blue-50 border-blue-200">
            <CalendarDays className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <p className="text-sm text-gray-700">
              Paket <strong className="text-blue-700">{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</strong> aktif hingga{" "}
              <strong>{expiryStr}</strong>
            </p>
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {PLANS.map(plan => {
            const isActive = currentPlan === plan.id;
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border-2 bg-white shadow-sm overflow-hidden transition-all ${
                  isActive ? plan.activeBorder + " shadow-md" : plan.border
                }`}
              >
                {isActive && (
                  <div className="absolute top-3 right-3 text-xs font-bold bg-blue-600 text-white px-2.5 py-1 rounded-full">
                    Paket Aktif
                  </div>
                )}

                <div className="p-7 flex flex-col flex-1">
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${plan.iconBg}`}>
                      <Icon className={`h-5 w-5 ${plan.iconColor}`} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{plan.name}</p>
                      {plan.badge && (
                        <span className="text-xs font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{plan.badge}</span>
                      )}
                    </div>
                  </div>

                  <div className="mb-6">
                    {plan.price === 0 ? (
                      <p className="text-3xl font-black text-gray-900">Gratis</p>
                    ) : (
                      <>
                        <p className="text-3xl font-black text-gray-900">{fmt(plan.price)}</p>
                        <p className="text-sm text-gray-400">/bulan</p>
                      </>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-8 flex-1">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <Check className="h-4 w-4 flex-shrink-0 mt-0.5 text-blue-500" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {isActive ? (
                    <div className="flex flex-col gap-2">
                      <div className="w-full py-2.5 rounded-xl text-sm font-semibold text-center bg-blue-600 text-white">
                        ✓ Paket Aktif
                      </div>
                      {plan.id !== "free" && (
                        <button onClick={() => handleUpgrade("free")}
                          className="w-full py-2 rounded-xl text-xs text-gray-400 hover:text-red-500 transition-colors">
                          Batalkan langganan
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.id)}
                      className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        plan.id === "silver"
                          ? "bg-gray-800 hover:bg-gray-700 text-white"
                          : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-300"
                      }`}
                    >
                      {plan.price === 0 ? "Pilih Free" : "Aktifkan Silver"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-3">
          <Zap className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Simulasi Pembayaran</p>
            <p className="text-xs text-blue-600 mt-1">
              Ini adalah simulasi tanpa payment gateway. Klik tombol untuk langsung mengaktifkan paket selama 30 hari.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
