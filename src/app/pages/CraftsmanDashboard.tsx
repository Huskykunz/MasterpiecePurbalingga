import { useState } from "react";
import { Package, MessageSquare, User, Plus, Edit, Trash2, CheckCircle, Clock, TrendingUp, TrendingDown, BarChart3, AlertTriangle, Star, ShoppingCart, Download, Calendar, Lightbulb, Target } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Label } from "../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Badge } from "../components/ui/badge";
import { Progress } from "../components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

export default function CraftsmanDashboard() {
  const [activeTab, setActiveTab] = useState("performance");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [dateRange, setDateRange] = useState("7months");

  const handleExportData = () => {
    // Mock export functionality
    const data = {
      salesTrend: salesTrendData,
      topProducts: topProducts,
      performance: performanceMetrics,
      ratings: customerRatings,
    };
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporan-performa-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Mock data for craftsman
  const craftsmanData = {
    name: "Budi Santoso",
    email: "budi@example.com",
    phone: "+62 812-3456-7890",
    workshop: "Bengkel Knalpot Budi",
    address: "Jl. Raya Purbalingga No. 45, Purbalingga",
    experience: "10 tahun",
    specialization: "Knalpot Racing dan Custom",
    bio: "Pengrajin knalpot berpengalaman lebih dari 10 tahun. Spesialisasi dalam pembuatan knalpot racing, custom, dan modifikasi. Menggunakan bahan berkualitas tinggi dan teknologi modern.",
  };

  const myProducts = [
    { id: 1, name: "Racing Exhaust Custom", price: 450000, stock: 5, sales: 12, image: "https://images.unsplash.com/photo-1767337628877-acc0a5e028d2?w=400" },
    { id: 2, name: "Sport Muffler Premium", price: 380000, stock: 8, sales: 20, image: "https://images.unsplash.com/photo-1774902410489-2995d6412f92?w=400" },
    { id: 3, name: "Carbon Fiber Exhaust", price: 420000, stock: 3, sales: 8, image: "https://images.unsplash.com/photo-1773114975602-f4d25cb110d1?w=400" },
  ];

  const customRequests = [
    {
      id: 1,
      customer: "Ahmad Yani",
      motorcycle: "Yamaha R15",
      design: "Dual tip carbon fiber dengan warna biru titanium",
      budget: "Rp 500.000",
      status: "Menunggu",
      date: "2025-01-08",
    },
    {
      id: 2,
      customer: "Siti Nurhaliza",
      motorcycle: "Honda CBR150R",
      design: "Single tip chrome dengan aksen merah",
      budget: "Rp 350.000",
      status: "Dikerjakan",
      date: "2025-01-06",
    },
    {
      id: 3,
      customer: "Bambang Susilo",
      motorcycle: "Kawasaki Ninja 250",
      design: "Quad tip matte black dengan carbon accent",
      budget: "Rp 600.000",
      status: "Selesai",
      date: "2025-01-03",
    },
  ];

  // Analytics Data
  const salesTrendData = [
    { month: "Jul", penjualan: 4200000, pesanan: 12 },
    { month: "Agu", penjualan: 5100000, pesanan: 15 },
    { month: "Sep", penjualan: 3800000, pesanan: 10 },
    { month: "Okt", penjualan: 6200000, pesanan: 18 },
    { month: "Nov", penjualan: 5500000, pesanan: 16 },
    { month: "Des", penjualan: 7300000, pesanan: 21 },
    { month: "Jan", penjualan: 6800000, pesanan: 19 },
  ];

  const topProducts = [
    { name: "Sport Muffler Premium", sales: 20, revenue: 7600000, rating: 4.8, stock: 8 },
    { name: "Racing Exhaust Custom", sales: 12, revenue: 5400000, rating: 4.9, stock: 5 },
    { name: "Carbon Fiber Exhaust", sales: 8, revenue: 3360000, rating: 4.7, stock: 3 },
  ];

  const categoryDistribution = [
    { name: "Racing", value: 45, color: "#3B82F6" },
    { name: "Custom", value: 30, color: "#10B981" },
    { name: "Sport", value: 25, color: "#F59E0B" },
  ];

  const customerRatings = {
    average: 4.8,
    total: 127,
    breakdown: [
      { stars: 5, count: 85, percentage: 67 },
      { stars: 4, count: 32, percentage: 25 },
      { stars: 3, count: 8, percentage: 6 },
      { stars: 2, count: 2, percentage: 2 },
      { stars: 1, count: 0, percentage: 0 },
    ],
  };

  const performanceMetrics = {
    orderFulfillmentRate: 96,
    averageResponseTime: "2.5 jam",
    customerSatisfaction: 4.8,
    repeatCustomerRate: 42,
    avgOrderValue: 425000,
    conversionRate: 18.5,
  };

  const lowStockAlerts = myProducts.filter((p) => p.stock < 5);

  const monthlyComparison = {
    currentMonth: {
      revenue: 6800000,
      orders: 19,
      newCustomers: 8,
    },
    previousMonth: {
      revenue: 7300000,
      orders: 21,
      newCustomers: 11,
    },
    growth: {
      revenue: -6.8,
      orders: -9.5,
      newCustomers: -27.3,
    },
  };

  const businessInsights = [
    {
      type: "success",
      icon: Star,
      title: "Performa Rating Sangat Baik",
      description: "Rating rata-rata Anda 4.8/5.0 lebih tinggi dari 85% penjual lain. Pertahankan kualitas produk dan layanan!",
      action: "Lihat Semua Ulasan",
    },
    {
      type: "warning",
      icon: AlertTriangle,
      title: "Stok Rendah Terdeteksi",
      description: "Carbon Fiber Exhaust hanya tersisa 3 unit. Produk ini terjual 8 unit bulan ini.",
      action: "Tambah Stok Sekarang",
    },
    {
      type: "info",
      icon: Target,
      title: "Peluang Peningkatan",
      description: "Tingkatkan foto produk untuk meningkatkan konversi hingga 30%. Gunakan foto dengan latar belakang putih.",
      action: "Pelajari Tips Fotografi",
    },
    {
      type: "success",
      icon: TrendingUp,
      title: "Produk Terlaris",
      description: "Sport Muffler Premium adalah best seller Anda dengan 20 penjualan. Pertimbangkan untuk menambah variasi produk serupa.",
      action: "Lihat Analisa Produk",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl mb-2">Dashboard Pengrajin</h1>
          <p className="text-gray-600">Selamat datang, {craftsmanData.name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Produk Saya</p>
                  <p className="text-3xl font-bold">{myProducts.length}</p>
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
                  <p className="text-gray-600 text-sm mb-1">Total Penjualan</p>
                  <p className="text-3xl font-bold">40</p>
                </div>
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Permintaan Custom</p>
                  <p className="text-3xl font-bold">{customRequests.length}</p>
                </div>
                <div className="bg-purple-100 rounded-full p-3">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm mb-1">Pendapatan</p>
                  <p className="text-3xl font-bold">Rp 16M</p>
                </div>
                <div className="bg-amber-100 rounded-full p-3">
                  <span className="text-amber-600 text-2xl font-bold">Rp</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="performance">Performa Toko</TabsTrigger>
            <TabsTrigger value="bio">Bio & Profil</TabsTrigger>
            <TabsTrigger value="products">Produk Saya</TabsTrigger>
            <TabsTrigger value="requests">Permintaan Custom</TabsTrigger>
          </TabsList>

          {/* Performance Tab */}
          <TabsContent value="performance">
            {/* Performance Header Controls */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">Analitik Performa Toko</h3>
                    <p className="text-sm text-gray-600">Pantau performa dan penjualan Anda</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[160px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="7days">7 Hari Terakhir</SelectItem>
                          <SelectItem value="30days">30 Hari Terakhir</SelectItem>
                          <SelectItem value="3months">3 Bulan Terakhir</SelectItem>
                          <SelectItem value="7months">7 Bulan Terakhir</SelectItem>
                          <SelectItem value="1year">1 Tahun Terakhir</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button variant="outline" onClick={handleExportData} className="gap-2">
                      <Download className="h-4 w-4" />
                      Ekspor Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 text-sm">Tingkat Pemenuhan</span>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold">{performanceMetrics.orderFulfillmentRate}%</span>
                      <span className="text-green-600 text-sm flex items-center mb-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +3%
                      </span>
                    </div>
                    <Progress value={performanceMetrics.orderFulfillmentRate} className="mt-3" />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 text-sm">Rata-rata Nilai Order</span>
                      <ShoppingCart className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold">Rp {(performanceMetrics.avgOrderValue / 1000).toFixed(0)}k</span>
                      <span className="text-green-600 text-sm flex items-center mb-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +12%
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 text-sm">Pelanggan Berulang</span>
                      <User className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-3xl font-bold">{performanceMetrics.repeatCustomerRate}%</span>
                      <span className="text-green-600 text-sm flex items-center mb-1">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +5%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Comparison */}
              <Card>
                <CardHeader className="p-6 border-b">
                  <h3 className="text-xl font-semibold">Perbandingan Bulan Ini vs Bulan Lalu</h3>
                  <p className="text-gray-600 text-sm">Januari 2025 vs Desember 2024</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">Pendapatan</span>
                        <div className={`flex items-center gap-1 text-sm font-medium ${monthlyComparison.growth.revenue >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {monthlyComparison.growth.revenue >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {Math.abs(monthlyComparison.growth.revenue)}%
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs text-gray-500">Bulan Ini</div>
                          <div className="font-semibold">Rp {(monthlyComparison.currentMonth.revenue / 1000000).toFixed(1)}jt</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Bulan Lalu</div>
                          <div className="text-sm text-gray-600">Rp {(monthlyComparison.previousMonth.revenue / 1000000).toFixed(1)}jt</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">Pesanan</span>
                        <div className={`flex items-center gap-1 text-sm font-medium ${monthlyComparison.growth.orders >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {monthlyComparison.growth.orders >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {Math.abs(monthlyComparison.growth.orders)}%
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs text-gray-500">Bulan Ini</div>
                          <div className="font-semibold">{monthlyComparison.currentMonth.orders} pesanan</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Bulan Lalu</div>
                          <div className="text-sm text-gray-600">{monthlyComparison.previousMonth.orders} pesanan</div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-gray-600">Pelanggan Baru</span>
                        <div className={`flex items-center gap-1 text-sm font-medium ${monthlyComparison.growth.newCustomers >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {monthlyComparison.growth.newCustomers >= 0 ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                          {Math.abs(monthlyComparison.growth.newCustomers)}%
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <div className="text-xs text-gray-500">Bulan Ini</div>
                          <div className="font-semibold">{monthlyComparison.currentMonth.newCustomers} pelanggan</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Bulan Lalu</div>
                          <div className="text-sm text-gray-600">{monthlyComparison.previousMonth.newCustomers} pelanggan</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sales Trend Chart */}
              <Card>
                <CardHeader className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold">Tren Penjualan</h3>
                      <p className="text-gray-600 text-sm">7 Bulan Terakhir</p>
                    </div>
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={salesTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "8px" }}
                        formatter={(value: number, name: string) => {
                          if (name === "penjualan") {
                            return [`Rp ${(value / 1000000).toFixed(1)}jt`, "Penjualan"];
                          }
                          return [value, "Pesanan"];
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="penjualan" stroke="#3B82F6" strokeWidth={2} name="Penjualan" />
                      <Line type="monotone" dataKey="pesanan" stroke="#10B981" strokeWidth={2} name="Pesanan" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Products and Category Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <Card>
                  <CardHeader className="p-6 border-b">
                    <h3 className="text-xl font-semibold">Produk Terlaris</h3>
                    <p className="text-gray-600 text-sm">Berdasarkan penjualan bulan ini</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {topProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold">{product.name}</span>
                              <Badge variant="secondary" className="text-xs">{product.sales} terjual</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>Rp {(product.revenue / 1000000).toFixed(1)}jt</span>
                              <span className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                {product.rating}
                              </span>
                              <span className={product.stock < 5 ? "text-red-600 font-medium" : ""}>
                                Stok: {product.stock}
                              </span>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-gray-300">#{index + 1}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Category Distribution */}
                <Card>
                  <CardHeader className="p-6 border-b">
                    <h3 className="text-xl font-semibold">Distribusi Kategori</h3>
                    <p className="text-gray-600 text-sm">Berdasarkan total penjualan</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={categoryDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-6 grid grid-cols-3 gap-4">
                      {categoryDistribution.map((cat) => (
                        <div key={cat.name} className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></div>
                            <span className="text-sm font-medium">{cat.name}</span>
                          </div>
                          <span className="text-2xl font-bold">{cat.value}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Customer Ratings and Low Stock Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Ratings */}
                <Card>
                  <CardHeader className="p-6 border-b">
                    <h3 className="text-xl font-semibold">Rating Pelanggan</h3>
                    <p className="text-gray-600 text-sm">{customerRatings.total} ulasan total</p>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4 mb-6 p-4 bg-blue-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-blue-600">{customerRatings.average}</div>
                        <div className="flex items-center justify-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {customerRatings.breakdown.map((rating) => (
                        <div key={rating.stars} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-16">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">{rating.stars}</span>
                          </div>
                          <Progress value={rating.percentage} className="flex-1" />
                          <span className="text-sm text-gray-600 w-12 text-right">{rating.count}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Low Stock Alerts */}
                <Card>
                  <CardHeader className="p-6 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold">Peringatan Stok Rendah</h3>
                        <p className="text-gray-600 text-sm">Produk dengan stok &lt; 5 unit</p>
                      </div>
                      <AlertTriangle className="h-6 w-6 text-amber-500" />
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {lowStockAlerts.length > 0 ? (
                      <div className="space-y-3">
                        {lowStockAlerts.map((product) => (
                          <div key={product.id} className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <div>
                              <div className="font-semibold text-amber-900">{product.name}</div>
                              <div className="text-sm text-amber-700">Stok tersisa: {product.stock} unit</div>
                            </div>
                            <Button size="sm" variant="outline" className="border-amber-600 text-amber-700 hover:bg-amber-100">
                              Tambah Stok
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                        <p>Semua produk memiliki stok yang cukup</p>
                      </div>
                    )}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Tips Manajemen Stok</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Periksa stok secara rutin untuk menghindari kehabisan</li>
                        <li>• Perhatikan produk terlaris dan jaga ketersediaannya</li>
                        <li>• Siapkan buffer stok untuk produk dengan permintaan tinggi</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Performance Metrics */}
              <Card>
                <CardHeader className="p-6 border-b">
                  <h3 className="text-xl font-semibold">Metrik Performa Lainnya</h3>
                  <p className="text-gray-600 text-sm">Data bulan ini</p>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-sm text-green-700 mb-2">Waktu Respons Rata-rata</div>
                      <div className="text-3xl font-bold text-green-600">{performanceMetrics.averageResponseTime}</div>
                      <div className="text-xs text-green-600 mt-1">Sangat Baik</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-700 mb-2">Kepuasan Pelanggan</div>
                      <div className="text-3xl font-bold text-blue-600">{performanceMetrics.customerSatisfaction}/5.0</div>
                      <div className="text-xs text-blue-600 mt-1">Luar Biasa</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-sm text-purple-700 mb-2">Tingkat Konversi</div>
                      <div className="text-3xl font-bold text-purple-600">{performanceMetrics.conversionRate}%</div>
                      <div className="text-xs text-purple-600 mt-1">Di Atas Rata-rata</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Insights */}
              <Card>
                <CardHeader className="p-6 border-b">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-6 w-6 text-amber-500" />
                    <div>
                      <h3 className="text-xl font-semibold">Wawasan Bisnis</h3>
                      <p className="text-gray-600 text-sm">Rekomendasi untuk meningkatkan performa toko Anda</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {businessInsights.map((insight, index) => {
                      const Icon = insight.icon;
                      const bgColor =
                        insight.type === "success" ? "bg-green-50 border-green-200" :
                        insight.type === "warning" ? "bg-amber-50 border-amber-200" :
                        "bg-blue-50 border-blue-200";
                      const iconColor =
                        insight.type === "success" ? "text-green-600" :
                        insight.type === "warning" ? "text-amber-600" :
                        "text-blue-600";
                      const buttonColor =
                        insight.type === "success" ? "border-green-600 text-green-700 hover:bg-green-100" :
                        insight.type === "warning" ? "border-amber-600 text-amber-700 hover:bg-amber-100" :
                        "border-blue-600 text-blue-700 hover:bg-blue-100";

                      return (
                        <div key={index} className={`p-4 rounded-lg border ${bgColor}`}>
                          <div className="flex items-start gap-3">
                            <Icon className={`h-5 w-5 mt-0.5 ${iconColor}`} />
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{insight.title}</h4>
                              <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                              <Button size="sm" variant="outline" className={buttonColor}>
                                {insight.action}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bio Tab */}
          <TabsContent value="bio">
            <Card>
              <CardHeader className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl">Profil Pengrajin</h2>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profil
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Profile Info */}
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-600">Nama Lengkap</Label>
                      <p className="text-lg font-medium mt-1">{craftsmanData.name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Email</Label>
                      <p className="text-lg font-medium mt-1">{craftsmanData.email}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Telepon</Label>
                      <p className="text-lg font-medium mt-1">{craftsmanData.phone}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Nama Bengkel</Label>
                      <p className="text-lg font-medium mt-1">{craftsmanData.workshop}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-600">Alamat Bengkel</Label>
                      <p className="text-lg font-medium mt-1">{craftsmanData.address}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Pengalaman</Label>
                      <p className="text-lg font-medium mt-1">{craftsmanData.experience}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Spesialisasi</Label>
                      <p className="text-lg font-medium mt-1">{craftsmanData.specialization}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <Label className="text-gray-600">Tentang Saya</Label>
                  <p className="text-lg mt-2 leading-relaxed">{craftsmanData.bio}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-2xl">Produk Saya</h2>
                  <p className="text-gray-600">Kelola produk yang Anda jual</p>
                </div>
                <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Tambah Produk
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Tambah Produk Baru</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>Nama Produk</Label>
                        <Input placeholder="Contoh: Racing Exhaust Premium" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Harga</Label>
                          <Input type="number" placeholder="450000" />
                        </div>
                        <div>
                          <Label>Stok</Label>
                          <Input type="number" placeholder="10" />
                        </div>
                      </div>
                      <div>
                        <Label>Deskripsi</Label>
                        <Textarea rows={4} placeholder="Deskripsikan produk Anda..." />
                      </div>
                      <div>
                        <Label>Gambar Produk</Label>
                        <Input type="file" accept="image/*" />
                      </div>
                      <div className="flex justify-end gap-3 mt-6">
                        <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
                          Batal
                        </Button>
                        <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddProductOpen(false)}>
                          Simpan Produk
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Gambar</TableHead>
                      <TableHead>Nama Produk</TableHead>
                      <TableHead>Harga</TableHead>
                      <TableHead>Stok</TableHead>
                      <TableHead>Terjual</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded" />
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>Rp {product.price.toLocaleString('id-ID')}</TableCell>
                        <TableCell>{product.stock} unit</TableCell>
                        <TableCell>{product.sales} unit</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600">
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

          {/* Custom Requests Tab */}
          <TabsContent value="requests">
            <Card>
              <CardHeader className="p-6 border-b">
                <h2 className="text-2xl">Permintaan Knalpot Custom</h2>
                <p className="text-gray-600">Kelola permintaan custom dari pelanggan</p>
              </CardHeader>
              <CardContent className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Pelanggan</TableHead>
                      <TableHead>Motor</TableHead>
                      <TableHead>Desain</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{request.date}</TableCell>
                        <TableCell className="font-medium">{request.customer}</TableCell>
                        <TableCell>{request.motorcycle}</TableCell>
                        <TableCell className="max-w-xs truncate">{request.design}</TableCell>
                        <TableCell>{request.budget}</TableCell>
                        <TableCell>
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            request.status === "Selesai" ? "bg-green-100 text-green-700" :
                            request.status === "Dikerjakan" ? "bg-blue-100 text-blue-700" :
                            "bg-yellow-100 text-yellow-700"
                          }`}>
                            {request.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Detail</Button>
                            {request.status === "Menunggu" && (
                              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                Terima
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
        </Tabs>
      </div>
    </div>
  );
}
