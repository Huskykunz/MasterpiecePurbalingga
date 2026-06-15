import { useState } from "react";
import { Package, Users, ShoppingCart, Settings, Plus, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { products } from "../data/products";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("products");

  // Mock data for demo
  const partners = [
    { id: 1, name: "Budi Santoso", email: "budi@example.com", phone: "+62 812-3456-7890", status: "Aktif", products: 12 },
    { id: 2, name: "Reza Pratama", email: "reza@example.com", phone: "+62 821-9876-5432", status: "Aktif", products: 8 },
    { id: 3, name: "Denny Kurniawan", email: "denny@example.com", phone: "+62 813-1234-5678", status: "Menunggu", products: 0 },
  ];

  const orders = [
    { id: "#001", customer: "Ahmad Yani", product: "Sport Exhaust Dual Tip", price: "Rp 450.000", status: "Diproses", date: "2025-01-08" },
    { id: "#002", customer: "Siti Nurhaliza", product: "Racing Muffler Pro", price: "Rp 380.000", status: "Dikirim", date: "2025-01-07" },
    { id: "#003", customer: "Bambang Susilo", product: "Carbon Fiber Exhaust Tip", price: "Rp 410.000", status: "Selesai", date: "2025-01-06" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Dashboard Admin</h1>
          <p className="text-gray-600">Kelola produk, mitra, dan pesanan</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Total Produk</p>
                  <p className="text-3xl font-bold">{products.length}</p>
                </div>
                <div className="bg-blue-100 rounded-full p-3">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Mitra Pengrajin</p>
                  <p className="text-3xl font-bold">{partners.length}</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Pesanan</p>
                  <p className="text-3xl font-bold">{orders.length}</p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <ShoppingCart className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Pendapatan</p>
                  <p className="text-3xl font-bold">Rp 5,2M</p>
                </div>
                <div className="bg-amber-100 rounded-full p-3">
                  <Settings className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="products">Produk</TabsTrigger>
            <TabsTrigger value="partners">Mitra Pengrajin</TabsTrigger>
            <TabsTrigger value="orders">Pesanan</TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-2xl">Manajemen Produk</h2>
                  <p className="text-gray-600">Kelola semua produk knalpot</p>
                </div>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Produk
                </Button>
              </CardHeader>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Gambar</TableHead>
                      <TableHead>Nama Produk</TableHead>
                      <TableHead>Kategori</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Stok</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.slice(0, 5).map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>Rp {product.price.toLocaleString('id-ID')}</TableCell>
                        <TableCell>
                          {product.inStock ? (
                            <span className="text-green-600 font-medium">Tersedia</span>
                          ) : (
                            <span className="text-red-600 font-medium">Habis</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Partners Tab */}
          <TabsContent value="partners">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-2xl">Mitra Pengrajin</h2>
                  <p className="text-gray-600">Kelola pendaftaran dan aktivitas mitra</p>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Telepon</TableHead>
                      <TableHead>Produk</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {partners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell className="font-medium">{partner.name}</TableCell>
                        <TableCell>{partner.email}</TableCell>
                        <TableCell>{partner.phone}</TableCell>
                        <TableCell>{partner.products} produk</TableCell>
                        <TableCell>
                          {partner.status === "Aktif" ? (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                              {partner.status}
                            </span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm">
                              {partner.status}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Lihat</Button>
                            {partner.status === "Menunggu" && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                Setujui
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader className="p-6 border-b">
                <h2 className="text-2xl">Pesanan Terbaru</h2>
                <p className="text-gray-600">Kelola dan pantau semua pesanan</p>
              </CardHeader>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Pesanan</TableHead>
                      <TableHead>Pelanggan</TableHead>
                      <TableHead>Produk</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.product}</TableCell>
                        <TableCell>{order.price}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            order.status === "Selesai" ? "bg-green-100 text-green-700" :
                            order.status === "Dikirim" ? "bg-blue-100 text-blue-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {order.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">Detail</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
