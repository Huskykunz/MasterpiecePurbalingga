import { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrderContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Package, ArrowLeft, Eye, MessageCircle, ChevronDown, ChevronUp, Clock, Cog, Truck, CheckCircle2, XCircle, Star } from "lucide-react";
import { Order } from "../types";
import { ReviewModal } from "../components/ReviewModal";
import { useReviews } from "../context/ReviewContext";

export default function Orders() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { getUserOrders } = useOrders();
  const { getProductReviews } = useReviews();
  const [activeTab, setActiveTab] = useState("all");
  const [reviewTarget, setReviewTarget] = useState<{ productId: string; productName: string } | null>(null);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const orders = getUserOrders(user.id);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const statusMap = {
    pending: { label: "Menunggu", color: "bg-yellow-100 text-yellow-800", border: "border-yellow-200" },
    processing: { label: "Diproses", color: "bg-blue-100 text-blue-800", border: "border-blue-200" },
    shipped: { label: "Dikirim", color: "bg-purple-100 text-purple-800", border: "border-purple-200" },
    delivered: { label: "Terkirim", color: "bg-green-100 text-green-800", border: "border-green-200" },
    cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-800", border: "border-red-200" },
  };

  const filterOrders = (status: string) => {
    if (status === "all") return orders;
    return orders.filter((order) => order.status === status);
  };

  const statusSteps = [
    { key: "pending", label: "Pesanan Diterima", icon: Clock, description: "Pesanan Anda telah kami terima dan sedang menunggu konfirmasi" },
    { key: "processing", label: "Sedang Diproses", icon: Cog, description: "Pesanan Anda sedang disiapkan oleh tim kami" },
    { key: "shipped", label: "Dalam Pengiriman", icon: Truck, description: "Pesanan Anda sedang dalam perjalanan menuju alamat Anda" },
    { key: "delivered", label: "Pesanan Selesai", icon: CheckCircle2, description: "Pesanan Anda telah diterima dengan sukses" },
  ];

  const getStepIndex = (status: Order["status"]) => {
    if (status === "cancelled") return -1;
    return statusSteps.findIndex((s) => s.key === status);
  };

  const OrderStatusTimeline = ({ order }: { order: Order }) => {
    const currentIndex = getStepIndex(order.status);
    if (order.status === "cancelled") {
      return (
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-200">
          <XCircle className="h-6 w-6 text-red-500 shrink-0" />
          <div>
            <p className="font-semibold text-red-700">Pesanan Dibatalkan</p>
            <p className="text-sm text-red-500">Pesanan ini telah dibatalkan</p>
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-1 pt-2">
        {statusSteps.map((step, index) => {
          const isDone = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;
          const Icon = step.icon;
          return (
            <div key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 shrink-0 ${
                  isDone ? "bg-green-500 border-green-500 text-white"
                  : isCurrent ? "bg-blue-600 border-blue-600 text-white"
                  : "bg-gray-100 border-gray-300 text-gray-400"
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                {index < statusSteps.length - 1 && (
                  <div className={`w-0.5 h-6 mt-1 ${isDone ? "bg-green-400" : "bg-gray-200"}`} />
                )}
              </div>
              <div className="pb-4">
                <p className={`text-sm font-semibold ${isCurrent ? "text-blue-600" : isPending ? "text-gray-400" : "text-gray-700"}`}>
                  {step.label}
                </p>
                {(isCurrent || isDone) && (
                  <p className="text-xs text-gray-500">{step.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const [showStatus, setShowStatus] = useState(false);
    return (
    <Card className={`${statusMap[order.status].border} border-2`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{order.id}</CardTitle>
            <p className="text-sm text-gray-500">
              {new Date(order.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <Badge className={statusMap[order.status].color}>
            {statusMap[order.status].label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Order Items */}
        <div className="space-y-2">
          {order.items.slice(0, 2).map((item) => (
            <div key={item.id} className="flex gap-3">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{item.name}</p>
                <p className="text-sm text-gray-500">
                  {item.quantity} x {formatPrice(item.price)}
                </p>
              </div>
            </div>
          ))}
          {order.items.length > 2 && (
            <p className="text-sm text-gray-500">
              +{order.items.length - 2} produk lainnya
            </p>
          )}
        </div>

        {/* Total */}
        <div className="pt-3 border-t flex justify-between items-center">
          <span className="text-sm text-gray-600">Total Pesanan</span>
          <span className="text-lg font-bold text-blue-600">
            {formatPrice(order.total)}
          </span>
        </div>

        {/* Status Timeline */}
        {showStatus && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Status Pesanan</h4>
            <OrderStatusTimeline order={order} />
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={showStatus ? "default" : "outline"}
            className="flex-1 min-w-[140px]"
            onClick={() => setShowStatus(!showStatus)}
          >
            {showStatus ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
            {showStatus ? "Sembunyikan" : "Cek Status"}
          </Button>
          {order.status === "delivered" && order.items.map((item) => {
            const alreadyReviewed = user ? getProductReviews(item.id).some(r => r.userId === user.id) : false;
            return (
              <Button
                key={item.id}
                variant="outline"
                size="sm"
                onClick={() => setReviewTarget({ productId: item.id, productName: item.name })}
                className={alreadyReviewed ? "border-green-200 text-green-600" : "border-amber-200 text-amber-600 hover:bg-amber-50"}
              >
                <Star className={`h-3.5 w-3.5 mr-1.5 ${alreadyReviewed ? "fill-green-400" : ""}`} />
                {alreadyReviewed ? "Diulas" : "Beri Ulasan"}
              </Button>
            );
          })}
          <Link to={`/order-confirmation/${order.id}`}>
            <Button variant="outline" size="icon"><Eye className="h-4 w-4" /></Button>
          </Link>
          <Link to={`/complaint?order=${order.id}`}>
            <Button variant="outline" size="icon"><MessageCircle className="h-4 w-4" /></Button>
          </Link>
        </div>
      </CardContent>
    </Card>
    );
  };

  return (
    <>
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-8 max-w-6xl flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pesanan Saya</h1>
            <p className="text-gray-500 text-sm mt-0.5">{orders.length} pesanan total</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 max-w-6xl py-8">

        {orders.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Belum ada pesanan</h3>
              <p className="text-gray-600 mb-6">
                Anda belum memiliki pesanan apapun
              </p>
              <Link to="/shop">
                <Button>Mulai Belanja</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="all">
                Semua ({orders.length})
              </TabsTrigger>
              <TabsTrigger value="pending">
                Menunggu ({filterOrders("pending").length})
              </TabsTrigger>
              <TabsTrigger value="processing">
                Diproses ({filterOrders("processing").length})
              </TabsTrigger>
              <TabsTrigger value="shipped">
                Dikirim ({filterOrders("shipped").length})
              </TabsTrigger>
              <TabsTrigger value="delivered">
                Selesai ({filterOrders("delivered").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filterOrders(activeTab).map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {filterOrders(activeTab).length === 0 && (
                <Card>
                  <CardContent className="pt-6 text-center py-8">
                    <p className="text-gray-500">
                      Tidak ada pesanan dengan status ini
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
    {reviewTarget && (
      <ReviewModal
        productId={reviewTarget.productId}
        productName={reviewTarget.productName}
        onClose={() => setReviewTarget(null)}
      />
    )}
    </>
  );
}
