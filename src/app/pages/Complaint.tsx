import { useState } from "react";
import { useNavigate, useSearchParams, Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useComplaints } from "../context/ComplaintContext";
import { useOrders } from "../context/OrderContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { toast } from "sonner";
import { MessageCircle, ArrowLeft, Send } from "lucide-react";
import { Complaint as ComplaintType } from "../types";

export default function Complaint() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { createComplaint } = useComplaints();
  const { getUserOrders } = useOrders();

  const orderId = searchParams.get("order");

  const [formData, setFormData] = useState({
    orderId: orderId || "",
    category: "product" as ComplaintType["category"],
    subject: "",
    description: "",
  });

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const userOrders = getUserOrders(user.id);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject || !formData.description) {
      toast.error("Harap lengkapi semua field");
      return;
    }

    if (formData.description.length < 20) {
      toast.error("Deskripsi keluhan minimal 20 karakter");
      return;
    }

    createComplaint(
      user.id,
      user.name,
      (formData.orderId && formData.orderId !== "none") ? formData.orderId : undefined,
      formData.category,
      formData.subject,
      formData.description
    );

    toast.success("Keluhan berhasil dikirim!", {
      description: "Tim kami akan segera menindaklanjuti keluhan Anda",
    });

    navigate("/complaints");
  };

  const categoryOptions = [
    { value: "product", label: "Produk" },
    { value: "delivery", label: "Pengiriman" },
    { value: "service", label: "Pelayanan" },
    { value: "payment", label: "Pembayaran" },
    { value: "other", label: "Lainnya" },
  ];

  return (
    <div className="min-h-screen py-8 bg-gray-50">
      <div className="container mx-auto px-4 max-w-3xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-blue-600 p-3 rounded-full">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl">Sampaikan Keluhan Anda</CardTitle>
                <CardDescription>
                  Kami siap membantu menyelesaikan masalah Anda
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Order Selection */}
              <div className="space-y-2">
                <Label htmlFor="orderId">Nomor Pesanan (Opsional)</Label>
                <Select
                  value={formData.orderId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, orderId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih pesanan terkait (jika ada)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tidak terkait pesanan</SelectItem>
                    {userOrders.map((order) => (
                      <SelectItem key={order.id} value={order.id}>
                        {order.id} - {new Date(order.createdAt).toLocaleDateString("id-ID")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Kategori Keluhan *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value as ComplaintType["category"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Judul Keluhan *</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="Ringkasan singkat keluhan Anda"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi Keluhan *</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={6}
                  placeholder="Jelaskan keluhan Anda secara detail..."
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
                <p className="text-sm text-gray-500">
                  Minimal 20 karakter ({formData.description.length}/20)
                </p>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1" size="lg">
                  <Send className="mr-2 h-5 w-5" />
                  Kirim Keluhan
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  size="lg"
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2">Waktu Respon</h3>
            <p className="text-sm text-gray-700">
              Tim kami akan merespon keluhan Anda dalam waktu maksimal 1x24 jam
              pada hari kerja. Anda dapat melihat status dan respon keluhan di
              halaman{" "}
              <button
                onClick={() => navigate("/complaints")}
                className="text-blue-600 hover:underline font-medium"
              >
                Daftar Keluhan Saya
              </button>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
