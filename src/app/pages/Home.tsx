import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { useProducts } from "../hooks/useProducts";
import { ProductCard } from "../components/ProductCard";
import { ArrowRight, Star, Shield, HeadphonesIcon, ChevronLeft, ChevronRight, Sparkles, Store, TrendingUp, Users, BarChart2 } from "lucide-react";
import { AIChatbot } from "../components/AIChatbot";
import { useAuth } from "../context/AuthContext";
import { useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Card, CardContent } from "../components/ui/card";

const heroSlides = [
  {
    image: "https://images.unsplash.com/photo-1767337628877-acc0a5e028d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3RvcmN5Y2xlJTIwZXhoYXVzdCUyMG11ZmZsZXJ8ZW58MXx8fHwxNzc4MDc1NTQ5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Knalpot Sport Dual Tip",
    price: "Rp 450.000",
    description: "Sistem dual tip premium dengan suara yang lebih bertenaga",
  },
  {
    image: "https://images.unsplash.com/photo-1774902410489-2995d6412f92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwyfHxtb3RvcmN5Y2xlJTIwZXhoYXVzdCUyMG11ZmZsZXJ8ZW58MXx8fHwxNzc4MDc1NTQ5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Muffler Racing Pro",
    price: "Rp 380.000",
    description: "Muffler racing performa tinggi",
  },
  {
    image: "https://images.unsplash.com/photo-1773114975602-f4d25cb110d1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw2fHxtb3RvcmN5Y2xlJTIwZXhoYXVzdCUyMG11ZmZsZXJ8ZW58MXx8fHwxNzc4MDc1NTQ5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Dual Pipe Performance",
    price: "Rp 480.000",
    description: "Sistem knalpot dual profesional",
  },
  {
    image: "https://images.unsplash.com/photo-1769537754889-8d731b83547f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHw5fHxtb3RvcmN5Y2xlJTIwZXhoYXVzdCUyMG11ZmZsZXJ8ZW58MXx8fHwxNzc4MDc1NTQ5fDA&ixlib=rb-4.1.0&q=80&w=1080",
    title: "Sistem Stainless Steel",
    price: "Rp 360.000",
    description: "Tahan karat dengan suara yang powerful",
  },
];

export default function Home() {
  const { user } = useAuth();
  const isSeller = user?.role === "craftsman";
  const allProducts = useProducts();
  const featuredProducts = allProducts
    .filter(p => p.inStock)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 4);
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="min-h-screen">
      <AIChatbot />

      {/* Hero Carousel Section */}
      <section className="relative bg-[#0d0f14] text-white overflow-hidden">
        {/* Subtle ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-transparent to-indigo-900/20 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 py-6 md:py-16 relative">
          <div className="relative">
            <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
              <div className="flex">
                {heroSlides.map((slide, index) => (
                  <div key={index} className="flex-[0_0_100%] min-w-0 px-1">
                    {/* Glassmorphism slide card */}
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-6 md:p-10 shadow-2xl">
                      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                        {/* Product image */}
                        <div className="w-full md:w-1/2 relative">
                          <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur-xl" />
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="relative w-full h-44 sm:h-64 md:h-96 object-cover rounded-xl shadow-2xl ring-1 ring-white/10"
                          />
                          <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white/80">
                            Produk Unggulan
                          </div>
                        </div>

                        {/* Text content */}
                        <div className="w-full md:w-1/2 text-center md:text-left">
                          <p className="text-blue-400 text-xs tracking-widest uppercase mb-2">Masterpiece Purbalingga</p>
                          <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-white mb-2 leading-tight">{slide.title}</h2>
                          <p className="text-sm md:text-lg mb-3 text-gray-400 hidden sm:block">{slide.description}</p>
                          <p className="text-2xl sm:text-4xl md:text-5xl mb-4 md:mb-8 text-amber-400 font-bold">{slide.price}</p>
                          <Link to="/shop">
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-900/40 md:text-base md:h-11 md:px-6">
                              Belanja Sekarang
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Featured product chips — glassmorphism row below carousel */}
            <div className="flex gap-3 mt-6 overflow-x-auto pb-1 scrollbar-hide">
              {heroSlides.map((slide, index) => (
                <div
                  key={index}
                  className="flex-shrink-0 flex items-center gap-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2.5 min-w-[150px] sm:min-w-[190px] hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => emblaApi?.scrollTo(index)}
                >
                  <img src={slide.image} alt={slide.title} className="w-10 h-10 rounded-lg object-cover ring-1 ring-white/10" />
                  <div className="min-w-0">
                    <p className="text-white text-xs font-medium truncate">{slide.title}</p>
                    <p className="text-amber-400 text-xs font-semibold">{slide.price}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Nav arrows */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 md:left-4 top-[45%] -translate-y-1/2 bg-black/40 backdrop-blur-sm border-white/15 text-white hover:bg-white/15 z-10"
              onClick={scrollPrev}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 md:right-4 top-[45%] -translate-y-1/2 bg-black/40 backdrop-blur-sm border-white/15 text-white hover:bg-white/15 z-10"
              onClick={scrollNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Design Visualizer Feature Banner */}
      <section className="py-12 bg-gradient-to-r from-gray-900 via-blue-900 to-gray-900">
        <div className="container mx-auto px-4">
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-blue-500/30 shadow-2xl overflow-hidden">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                    <Sparkles className="h-8 w-8 text-blue-400" />
                    <span className="bg-amber-500 text-black px-3 py-1 rounded-full text-sm font-bold">NEW</span>
                  </div>
                  <h2 className="text-3xl md:text-4xl text-white mb-4">
                    Visualisasi Desain
                  </h2>
                  <p className="text-lg text-gray-300 mb-6">
                    Desain knalpot custom Anda dengan builder interaktif kami atau deskripsikan visi Anda. Lihat hasilnya dalam hitungan detik!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                    <Link to="/ai-visualizer">
                      <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                        <Sparkles className="mr-2 h-5 w-5" />
                        Coba Visualisasi Desain
                      </Button>
                    </Link>
                    <Button size="lg" variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">
                      Pelajari Lebih Lanjut
                    </Button>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="relative">
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl p-6 backdrop-blur-sm border border-blue-400/30">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                          <Sparkles className="h-6 w-6 text-blue-400 mb-2" />
                          <p className="text-xs text-gray-400">Bertenaga AI</p>
                        </div>
                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                          <Shield className="h-6 w-6 text-green-400 mb-2" />
                          <p className="text-xs text-gray-400">Preview Instan</p>
                        </div>
                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                          <Star className="h-6 w-6 text-yellow-400 mb-2" />
                          <p className="text-xs text-gray-400">Kualitas Premium</p>
                        </div>
                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                          <ArrowRight className="h-6 w-6 text-purple-400 mb-2" />
                          <p className="text-xs text-gray-400">Mudah Digunakan</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[#0d0f14] border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/8 hover:-translate-y-1 transition-all duration-300">
              <div className="bg-blue-600/20 border border-blue-500/30 rounded-full p-4 mb-4">
                <Shield className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">Garansi Kualitas</h3>
              <p className="text-gray-500 text-sm">Garansi 1 tahun untuk semua sistem knalpot</p>
            </div>
            <div className="flex flex-col items-center text-center p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/8 hover:-translate-y-1 transition-all duration-300">
              <div className="bg-blue-600/20 border border-blue-500/30 rounded-full p-4 mb-4">
                <HeadphonesIcon className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-white">Dukungan 24/7</h3>
              <p className="text-gray-500 text-sm">Bantuan ahli siap membantu kapan saja</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16 bg-[#0d0f14]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">Sistem Knalpot Unggulan</h2>
              <p className="text-gray-500">Pilihan terbaik dari koleksi premium kami</p>
            </div>
            <Link to="/shop">
              <Button variant="outline" size="lg" className="border-white/15 text-gray-300 hover:bg-white/10 hover:text-white bg-transparent">
                Lihat Semua
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <div
                key={product.id}
                className="opacity-0 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
              >
                <ProductCard product={product} dark />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-[#0d0f14] border-t border-white/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white text-center mb-3">Kata Pelanggan Kami</h2>
          <p className="text-gray-500 text-center mb-12">Ribuan pelanggan puas di seluruh Indonesia</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Budi Santoso", text: "Kualitas luar biasa! Suaranya dalam dan powerful. Instalasi mudah. Sangat merekomendasikan knalpot ini!" },
              { name: "Reza Pratama", text: "Upgrade knalpot terbaik yang pernah saya lakukan! Peningkatan performa terasa dan kualitasnya top!" },
              { name: "Denny Kurniawan", text: "Pengiriman cepat dan layanan pelanggan sangat baik. Motor saya sekarang suaranya luar biasa. Worth it!" },
            ].map((t) => (
              <div key={t.name} className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-2xl p-7 hover:bg-white/8 hover:-translate-y-1 transition-all duration-300">
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map((s) => <Star key={s} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-gray-400 mb-5 leading-relaxed text-sm">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold">
                    {t.name.charAt(0)}
                  </div>
                  <p className="text-white text-sm font-medium">{t.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seller Signup CTA Banner */}
      <section className="py-16 bg-[#0d0f14] border-t border-white/5">
        <div className="container mx-auto px-4">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <Store className="h-6 w-6 text-blue-400" />
                  <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
                    Bergabung Sekarang
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {isSeller ? "Pantau Performa Toko Anda" : "Jual Produk Knalpot Anda di Sini"}
                </h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  {isSeller
                    ? "Lihat statistik penjualan, ulasan pembeli, dan kelola stok produk Anda langsung dari dashboard penjual."
                    : "Bergabunglah dengan platform marketplace knalpot terbesar di Purbalingga. Dapatkan akses ke ribuan pelanggan potensial!"}
                </p>
                <div className="flex flex-wrap gap-4 mb-8 justify-center md:justify-start">
                  {[
                    { icon: Users, label: "Jangkauan Luas" },
                    { icon: TrendingUp, label: "Dashboard Analitik" },
                    { icon: Star, label: "Komisi Kompetitif" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-gray-300 text-sm">
                      <div className="bg-blue-600/20 border border-blue-500/20 rounded-lg p-1.5">
                        <Icon className="h-4 w-4 text-blue-400" />
                      </div>
                      {label}
                    </div>
                  ))}
                </div>
                {isSeller ? (
                  <Link to="/account?tab=seller-stats">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40">
                      <BarChart2 className="mr-2 h-5 w-5" />
                      Statistik Penjualan
                    </Button>
                  </Link>
                ) : (
                  <Link to="/seller-signup">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/40">
                      Daftar Sebagai Penjual
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4 w-full">
                {[
                  { val: "500+", label: "Penjual Aktif" },
                  { val: "10K+", label: "Produk Terjual" },
                  { val: "4.8★", label: "Rating Platform" },
                  { val: "0%", label: "Biaya Daftar" },
                ].map(({ val, label }) => (
                  <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                    <p className="text-3xl font-bold text-white mb-1">{val}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-[#0d0f14] border-t border-white/5 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-transparent to-indigo-900/15 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-5">
            Upgrade Motor Anda Hari Ini
          </h2>
          <p className="text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Bergabunglah dengan ribuan pengendara yang puas yang telah mentransformasi motor mereka dengan sistem knalpot premium kami.
          </p>
          <Link to="/shop">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/50 px-8">
              Jelajahi Knalpot
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
