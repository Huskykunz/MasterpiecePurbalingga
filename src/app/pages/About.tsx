import { Heart, Target, Users, Award, Wrench, Clock, MapPin } from "lucide-react";

const stats = [
  { val: "500+", label: "Pelanggan Puas" },
  { val: "3", label: "Mitra Pengrajin" },
  { val: "12+", label: "Kategori Produk" },
  { val: "4.8★", label: "Rating Platform" },
];

const values = [
  { icon: Target, title: "Misi Kami", color: "bg-blue-50 text-blue-600", text: "Menyediakan sistem knalpot premium yang meningkatkan performa, suara, dan gaya motor Anda dengan harga terjangkau." },
  { icon: Heart, title: "Nilai Kami", color: "bg-rose-50 text-rose-500", text: "Kerajinan berkualitas, material superior, dan kepuasan pelanggan adalah inti dari semua yang kami lakukan." },
  { icon: Users, title: "Komunitas", color: "bg-violet-50 text-violet-600", text: "Kami bekerja sama dengan pengrajin terampil dan bengkel mitra terpercaya di seluruh Jawa Tengah." },
];

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-16 text-center max-w-3xl">
          <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase">Tentang Kami</span>
          <h1 className="text-4xl font-bold text-gray-900 mt-3 mb-5">Masterpiece Purbalingga</h1>
          <p className="text-gray-500 leading-relaxed">
            Mitra terpercaya untuk sistem knalpot motor premium. Kami mengkhususkan diri pada knalpot
            custom berkinerja tinggi yang menghasilkan suara dan tenaga superior untuk kendaraan Anda.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map(({ val, label }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
              <p className="text-3xl font-bold text-blue-600 mb-1">{val}</p>
              <p className="text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
          {values.map(({ icon: Icon, title, color, text }) => (
            <div key={title} className="bg-white border border-gray-100 rounded-2xl p-7 shadow-sm">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${color} mb-5`}>
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-3">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8 md:p-12 mb-12 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cerita Kami</h2>
          <div className="space-y-4 text-gray-500 leading-relaxed text-sm">
            <p>Didirikan pada tahun 2026, Masterpiece Purbalingga dimulai sebagai proyek passion mahasiswa yang menggemari motor dan ingin menyediakan sistem knalpot berkualitas dengan harga terjangkau.</p>
            <p>Saat ini, kami bangga menawarkan berbagai macam sistem knalpot dari sport hingga cruiser, racing hingga desain custom. Setiap sistem diuji untuk performa, daya tahan, dan kualitas suara sebelum sampai ke tangan Anda.</p>
            <p>Ketika Anda membeli dari Masterpiece Purbalingga, Anda mendapatkan lebih dari sekadar knalpot — Anda mendapatkan saran ahli, jaminan kualitas, dan dukungan berkelanjutan.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Award, label: "Garansi 1 Tahun", sub: "Setiap produk bergaransi resmi" },
            { icon: Wrench, label: "Handcrafted", sub: "Dibuat tangan oleh pengrajin ahli" },
            { icon: Clock, label: "Pengiriman Cepat", sub: "Estimasi 2–5 hari kerja" },
            { icon: MapPin, label: "Purbalingga, Jateng", sub: "Produk lokal berkualitas ekspor" },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-start gap-4">
              <div className="bg-blue-50 rounded-xl p-2.5 flex-shrink-0">
                <Icon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
