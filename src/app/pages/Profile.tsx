import { useState } from "react";
import { useNavigate, Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { toast } from "sonner";
import { User, Mail, ShoppingBag, LogOut, ArrowLeft, MessageSquare } from "lucide-react";
import { Badge } from "../components/ui/badge";

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const { getItemCount } = useCart();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleSave = () => {
    // In a real app, this would call an API to update user data
    toast.success("Profil berhasil diperbarui", {
      description: "Perubahan Anda telah disimpan",
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    toast.success("Berhasil keluar");
    navigate("/");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Sidebar */}
          <Card className="md:col-span-1 h-fit shadow-lg">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-600 p-6 rounded-full">
                  <User className="h-12 w-12 text-white" />
                </div>
              </div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription className="flex items-center justify-center gap-2 mt-2">
                <Mail className="h-3 w-3" />
                {user.email}
              </CardDescription>
              <div className="flex justify-center mt-3">
                <Badge variant="secondary" className="capitalize">
                  {user.role === "customer" ? "Pelanggan" : user.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/orders")}
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Pesanan Saya
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate("/complaints")}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Keluhan Saya
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </Button>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card className="md:col-span-2 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Informasi Profil</CardTitle>
                  <CardDescription>
                    Kelola informasi akun Anda
                  </CardDescription>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)}>
                    Edit Profil
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    type="text"
                    value={user.role === "customer" ? "Pelanggan" : user.role}
                    disabled
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3">
                  <Button onClick={handleSave} className="flex-1">
                    Simpan Perubahan
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user.name,
                        email: user.email,
                      });
                    }}
                    className="flex-1"
                  >
                    Batal
                  </Button>
                </div>
              )}

              {/* Account Stats */}
              <div className="pt-6 border-t">
                <h3 className="font-semibold mb-4">Statistik Akun</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Total Pesanan</p>
                    <p className="text-2xl font-bold text-blue-600">0</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Produk di Keranjang</p>
                    <p className="text-2xl font-bold text-green-600">{getItemCount()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
