import { useState } from "react";
import { useNavigate, Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useOrders } from "../context/OrderContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { toast } from "sonner";
import { ShoppingBag, MapPin, CreditCard, ArrowLeft, Package } from "lucide-react";
import { ShippingAddress } from "../types";

export default function Checkout() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { cart, getTotalPrice, clearCart } = useCart();
  const { createOrder } = useOrders();

  const [shippingData, setShippingData] = useState<ShippingAddress>({
    fullName: user?.name || "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    notes: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("cod");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (cart.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setShippingData({
      ...shippingData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    const required = ["fullName", "phone", "address", "city", "province", "postalCode"];
    for (const field of required) {
      if (!shippingData[field as keyof ShippingAddress]) {
        toast.error("Lengkapi semua data pengiriman");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const order = createOrder(
      user!.id,
      cart,
      getTotalPrice(),
      shippingData,
      paymentMethod
    );

    clearCart();

    toast.success("Pesanan berhasil dibuat!", {
      description: `Nomor pesanan: ${order.id}`,
    });

    navigate(`/order-confirmation/${order.id}`);
  };

  const subtotal = getTotalPrice();
  const shippingCost = 15000;
  const total = subtotal + shippingCost;

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/cart")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Keranjang
        </Button>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Alamat Pengiriman
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="fullName">Nama Lengkap *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={shippingData.fullName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Nomor Telepon *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="08xxxxxxxxxx"
                        value={shippingData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="postalCode">Kode Pos *</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={shippingData.postalCode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Alamat Lengkap *</Label>
                      <Textarea
                        id="address"
                        name="address"
                        rows={3}
                        placeholder="Jalan, nomor rumah, RT/RW"
                        value={shippingData.address}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Kota/Kabupaten *</Label>
                      <Input
                        id="city"
                        name="city"
                        value={shippingData.city}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="province">Provinsi *</Label>
                      <Input
                        id="province"
                        name="province"
                        value={shippingData.province}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="notes">Catatan (Opsional)</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        rows={2}
                        placeholder="Catatan untuk kurir atau penjual"
                        value={shippingData.notes}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
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
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="cod" id="cod" />
                      <Label htmlFor="cod" className="flex-1 cursor-pointer">
                        <div className="font-medium">Bayar di Tempat (COD)</div>
                        <div className="text-sm text-gray-500">Bayar saat barang diterima</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="transfer" id="transfer" />
                      <Label htmlFor="transfer" className="flex-1 cursor-pointer">
                        <div className="font-medium">Transfer Bank</div>
                        <div className="text-sm text-gray-500">Transfer ke rekening toko</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="ewallet" id="ewallet" />
                      <Label htmlFor="ewallet" className="flex-1 cursor-pointer">
                        <div className="font-medium">E-Wallet</div>
                        <div className="text-sm text-gray-500">OVO, GoPay, Dana, ShopeePay</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Ringkasan Pesanan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
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
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ongkos Kirim</span>
                      <span>{formatPrice(shippingCost)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>Total</span>
                      <span className="text-blue-600">{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg">
                    <Package className="mr-2 h-5 w-5" />
                    Buat Pesanan
                  </Button>

                  <p className="text-xs text-gray-500 text-center">
                    Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
