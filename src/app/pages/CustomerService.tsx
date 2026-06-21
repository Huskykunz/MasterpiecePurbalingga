import { useState } from "react";
import { Link } from "react-router";
import { MessageCircle, Phone, Mail, Clock, ChevronDown, ChevronUp, Send, ArrowLeft, Headphones } from "lucide-react";
import { toast } from "sonner";

const FAQ = [
  { q: "Bagaimana cara memesan knalpot custom?", a: "Klik tombol 'Pesan Sekarang' di halaman Visualisasi AI, isi detail desain Anda, lalu tim kami akan menghubungi dalam 1×24 jam." },
  { q: "Berapa lama waktu pengerjaan pesanan custom?", a: "Rata-rata 7–14 hari kerja tergantung kompleksitas desain dan ketersediaan material." },
  { q: "Apakah ada garansi untuk produk?", a: "Ya, semua produk kami bergaransi 1 tahun untuk kerusakan material dan pengerjaan." },
  { q: "Bagaimana cara melacak pesanan saya?", a: "Masuk ke akun Anda → Pesanan Saya. Status pesanan diperbarui secara real-time." },
  { q: "Bisakah saya mengubah desain setelah memesan?", a: "Perubahan desain bisa dilakukan dalam 24 jam setelah pemesanan. Hubungi CS kami segera." },
  { q: "Metode pembayaran apa yang tersedia?", a: "Kami menerima Transfer Bank, E-Wallet (OVO, GoPay, Dana), dan Bayar di Tempat (COD) untuk area tertentu." },
];

export default function CustomerService() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaq = FAQ.filter(
    f => f.q.toLowerCase().includes(searchQuery.toLowerCase()) || f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error("Lengkapi semua field wajib"); return; }
    setSending(true);
    setTimeout(() => {
      setSending(false);
      toast.success("Pesan berhasil dikirim!", { description: "Tim CS kami akan membalas dalam 1×24 jam." });
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Service</h1>
              <p className="text-gray-400 text-sm mt-0.5">Tim kami siap membantu Anda 7 hari seminggu</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — contact info + form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick contact cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Phone, label: "Telepon", value: "+62 812-3456-7890", sub: "Senin–Sabtu 09:00–18:00", color: "bg-green-50 text-green-600" },
                { icon: Mail, label: "Email", value: "cs@masterpiecepbg.com", sub: "Balas dalam 1×24 jam", color: "bg-blue-50 text-blue-600" },
                { icon: MessageCircle, label: "Live Chat", value: "Chat langsung", sub: "Tersedia 24/7 via AI", color: "bg-purple-50 text-purple-600" },
              ].map(({ icon: Icon, label, value, sub, color }) => (
                <div key={label} className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="font-semibold text-sm text-gray-900">{label}</p>
                  <p className="text-sm text-gray-700 mt-0.5">{value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                </div>
              ))}
            </div>

            {/* Contact form */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
                <Send className="h-4 w-4 text-blue-600" /> Kirim Pesan
              </h2>
              <form onSubmit={handleSend} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama *</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Nama Anda" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                    <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                      placeholder="email@anda.com" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Subjek</label>
                  <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="Topik pertanyaan Anda" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Pesan *</label>
                  <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    rows={4} placeholder="Ceritakan detail pertanyaan atau kendala Anda..."
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400 resize-none" />
                </div>
                <button type="submit" disabled={sending}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                  <Send className="h-4 w-4" />
                  {sending ? "Mengirim..." : "Kirim Pesan"}
                </button>
              </form>
            </div>
          </div>

          {/* Right — FAQ */}
          <div className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <Clock className="h-4 w-4 text-blue-600" /> FAQ
                </h2>
                {/* Search inside FAQ */}
                <input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Cari pertanyaan..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:bg-white focus:outline-none focus:border-blue-400"
                />
              </div>
              <div className="divide-y divide-gray-50">
                {filteredFaq.length === 0 ? (
                  <div className="px-5 py-8 text-center text-gray-400 text-sm">Tidak ada hasil untuk "{searchQuery}"</div>
                ) : filteredFaq.map((item, i) => (
                  <div key={i}>
                    <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full text-left px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors">
                      <span className="text-sm font-medium text-gray-800">{item.q}</span>
                      {openFaq === i ? <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />}
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-4">
                        <p className="text-sm text-gray-600 leading-relaxed">{item.a}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-600 rounded-2xl p-5 text-white">
              <p className="font-bold mb-1">Butuh bantuan segera?</p>
              <p className="text-blue-100 text-sm mb-3">Hubungi kami via WhatsApp untuk respon tercepat.</p>
              <a href="https://wa.me/6285892673738" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold text-sm px-4 py-2 rounded-xl hover:bg-blue-50 transition-colors">
                <MessageCircle className="h-4 w-4" /> Chat WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
