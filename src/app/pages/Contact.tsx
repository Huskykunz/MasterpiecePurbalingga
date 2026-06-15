import { Mail, Phone, MapPin, Clock, MessageCircle, Users } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useState } from "react";
import { Link } from "react-router";

export default function Contact() {
  const [activeTab, setActiveTab] = useState("contact");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Terima kasih atas pesan Anda! Kami akan segera menghubungi Anda.");
  };

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Terima kasih atas minat Anda untuk menjadi mitra! Tim kami akan meninjau aplikasi Anda dan menghubungi Anda segera.");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="container mx-auto px-4 py-12 text-center max-w-2xl">
          <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase">Kontak</span>
          <h1 className="text-3xl font-bold text-gray-900 mt-3 mb-3">Hubungi Kami</h1>
          <p className="text-gray-500">Punya pertanyaan atau butuh bantuan? Kami siap membantu!</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10">
        {/* AI quick access */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 rounded-xl p-2.5 flex-shrink-0">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Butuh Bantuan Cepat?</h3>
                <p className="text-gray-500 text-xs mt-0.5">Chat dengan asisten AI kami untuk jawaban instan!</p>
              </div>
            </div>
            <Link to="/">
              <Button className="bg-blue-600 hover:bg-blue-500 rounded-xl text-sm h-9">Chat Sekarang</Button>
            </Link>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto mb-12">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="contact">Hubungi Kami</TabsTrigger>
            <TabsTrigger value="partner">
              <Users className="h-4 w-4 mr-2" />
              Daftar sebagai Mitra
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contact">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-7">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Kirim Pesan</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { id: "name", label: "Nama", type: "text", placeholder: "Nama Anda" },
                    { id: "email", label: "Email", type: "email", placeholder: "email@anda.com" },
                    { id: "subject", label: "Subjek", type: "text", placeholder: "Bagaimana kami bisa membantu?" },
                  ].map(({ id, label, type, placeholder }) => (
                    <div key={id}>
                      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
                      <Input id={id} type={type} placeholder={placeholder} required className="rounded-xl border-gray-200 bg-gray-50 focus:bg-white" />
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Pesan</label>
                    <Textarea placeholder="Pesan Anda..." rows={5} required className="rounded-xl border-gray-200 bg-gray-50 focus:bg-white resize-none" />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 rounded-xl h-11">Kirim Pesan</Button>
                </form>
              </div>

              <div className="space-y-4">
                {[
                  { icon: MapPin, title: "Alamat", lines: ["Jl. Raya Purbalingga No. 123", "Purbalingga, Jawa Tengah 53316"] },
                  { icon: Phone, title: "Telepon", lines: ["+62 812-3456-7890", "+62 821-9876-5432"] },
                  { icon: Mail, title: "Email", lines: ["info@masterpiecepbg.com", "support@masterpiecepbg.com"] },
                  { icon: Clock, title: "Jam Operasional", lines: ["Senin–Jumat: 09:00–18:00", "Sabtu: 09:00–16:00 · Minggu: Tutup"] },
                ].map(({ icon: Icon, title, lines }) => (
                  <div key={title} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex items-start gap-4">
                    <div className="bg-blue-50 rounded-xl p-2.5 flex-shrink-0">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm mb-1">{title}</p>
                      {lines.map((l) => <p key={l} className="text-gray-500 text-sm">{l}</p>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="partner">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-7 mt-6">
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <div className="bg-blue-50 rounded-2xl p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Menjadi Mitra Pengrajin</h2>
                    <p className="text-gray-500 text-sm">
                      Bergabunglah dengan jaringan pengrajin terampil kami. Isi formulir di bawah untuk mendaftar.
                    </p>
                  </div>

                  <form onSubmit={handlePartnerSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="partner-name" className="block text-sm font-medium mb-2">
                          Nama Lengkap
                        </label>
                        <Input
                          id="partner-name"
                          type="text"
                          placeholder="Nama lengkap Anda"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="partner-phone" className="block text-sm font-medium mb-2">
                          Nomor Telepon
                        </label>
                        <Input
                          id="partner-phone"
                          type="tel"
                          placeholder="+62 xxx xxxx xxxx"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="partner-email" className="block text-sm font-medium mb-2">
                        Alamat Email
                      </label>
                      <Input
                        id="partner-email"
                        type="email"
                        placeholder="email@anda.com"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="business-name" className="block text-sm font-medium mb-2">
                        Nama Usaha/Bengkel
                      </label>
                      <Input
                        id="business-name"
                        type="text"
                        placeholder="Nama bengkel Anda"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="partner-address" className="block text-sm font-medium mb-2">
                        Alamat Bengkel
                      </label>
                      <Textarea
                        id="partner-address"
                        placeholder="Alamat lengkap termasuk kota dan kode pos"
                        rows={3}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="experience" className="block text-sm font-medium mb-2">
                        Tahun Pengalaman
                      </label>
                      <Input
                        id="experience"
                        type="number"
                        placeholder="Jumlah tahun"
                        min="1"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="specialization" className="block text-sm font-medium mb-2">
                        Spesialisasi
                      </label>
                      <Textarea
                        id="specialization"
                        placeholder="Deskripsikan keahlian Anda (misal: knalpot custom, muffler racing, finishing chrome)"
                        rows={4}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="portfolio" className="block text-sm font-medium mb-2">
                        Portfolio/Website (Opsional)
                      </label>
                      <Input
                        id="portfolio"
                        type="url"
                        placeholder="https://portfolio-anda.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="why-partner" className="block text-sm font-medium mb-2">
                        Mengapa Anda ingin menjadi mitra?
                      </label>
                      <Textarea
                        id="why-partner"
                        placeholder="Ceritakan motivasi Anda..."
                        rows={4}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 rounded-xl h-11">
                      Kirim Aplikasi Mitra
                    </Button>
                  </form>
                </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
