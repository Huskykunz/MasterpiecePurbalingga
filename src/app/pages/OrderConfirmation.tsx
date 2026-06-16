import { useParams, useNavigate, Link } from "react-router";
import { useOrders } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { CheckCircle, Package, MapPin, CreditCard, Home, FileText, Receipt } from "lucide-react";

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrder } = useOrders();
  const { user } = useAuth();

  const order = getOrder(orderId || "");

  if (!order || order.userId !== user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-xl mb-4">Pesanan tidak ditemukan</p>
            <Button onClick={() => navigate("/")}>Kembali ke Beranda</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const statusMap = {
    pending: { label: "Menunggu Konfirmasi", color: "bg-yellow-100 text-yellow-800" },
    processing: { label: "Diproses", color: "bg-blue-100 text-blue-800" },
    shipped: { label: "Dikirim", color: "bg-purple-100 text-purple-800" },
    delivered: { label: "Terkirim", color: "bg-green-100 text-green-800" },
    cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-800" },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Success Header */}
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-green-900 mb-2">
              Pesanan Berhasil Dibuat!
            </h1>
            <p className="text-green-700 mb-4">
              Terima kasih atas pesanan Anda. Kami akan segera memprosesnya.
            </p>
            <div className="inline-block bg-white px-6 py-3 rounded-lg shadow">
              <p className="text-sm text-gray-600">Nomor Pesanan</p>
              <p className="text-2xl font-bold text-gray-900">{order.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Order Details */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Status Pesanan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className={statusMap[order.status].color}>
                  {statusMap[order.status].label}
                </Badge>
                <p className="text-sm text-gray-600 mt-2">
                  Dibuat pada: {new Date(order.createdAt).toLocaleString("id-ID")}
                </p>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Alamat Pengiriman
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{order.shippingAddress.fullName}</p>
                <p className="text-sm text-gray-600">{order.shippingAddress.phone}</p>
                <p className="text-sm text-gray-600 mt-2">
                  {order.shippingAddress.address}
                  <br />
                  {order.shippingAddress.city}, {order.shippingAddress.province}
                  <br />
                  {order.shippingAddress.postalCode}
                </p>
                {order.shippingAddress.notes && (
                  <p className="text-sm text-gray-500 mt-2 italic">
                    Catatan: {order.shippingAddress.notes}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Metode Pembayaran
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="capitalize">
                  {order.paymentMethod === "cod" && "Bayar di Tempat (COD)"}
                  {order.paymentMethod === "transfer" && "Transfer Bank"}
                  {order.paymentMethod === "ewallet" && "E-Wallet"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Items */}
          <Card>
            <CardHeader>
              <CardTitle>Produk yang Dipesan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3 pb-3 border-b last:border-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} x {formatPrice(item.price)}
                    </p>
                    <p className="text-sm font-semibold text-blue-600 mt-1">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPrice(order.total - 15000)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ongkos Kirim</span>
                  <span>{formatPrice(15000)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-blue-600">{formatPrice(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <Link to="/" className="flex-1">
            <Button variant="outline" className="w-full" size="lg">
              <Home className="mr-2 h-5 w-5" />
              Kembali ke Beranda
            </Button>
          </Link>
          <Link to={`/invoice/${order.id}`} className="flex-1">
            <Button variant="outline" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50" size="lg">
              <Receipt className="mr-2 h-5 w-5" />
              Lihat Invoice
            </Button>
          </Link>
          <Link to="/orders" className="flex-1">
            <Button className="w-full" size="lg">
              <FileText className="mr-2 h-5 w-5" />
              Semua Pesanan
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
