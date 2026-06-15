import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { Mail, Lock, User, Store, Eye, EyeOff } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error("Password tidak cocok");
    if (form.password.length < 6) return toast.error("Password minimal 6 karakter");
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success("Akun berhasil dibuat!");
      navigate("/shop");
    } catch {
      toast.error("Email sudah terdaftar");
    } finally {
      setLoading(false);
    }
  };

  const field = (id: string, val: string) => setForm((f) => ({ ...f, [id]: val }));

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <Store className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Buat Akun Baru</h1>
          <p className="text-gray-500 text-sm mt-1">Masterpiece Purbalingga</p>
        </div>

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-gray-700 text-sm font-medium">Nama Lengkap</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Nama Anda" value={form.name} onChange={(e) => field("name", e.target.value)}
                  required className="pl-9 rounded-xl border-gray-200 bg-gray-50 focus:bg-white" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-gray-700 text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input type="email" placeholder="nama@example.com" value={form.email} onChange={(e) => field("email", e.target.value)}
                  required className="pl-9 rounded-xl border-gray-200 bg-gray-50 focus:bg-white" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-gray-700 text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input type={showPass ? "text" : "password"} placeholder="Min. 6 karakter" value={form.password}
                  onChange={(e) => field("password", e.target.value)} required
                  className="pl-9 pr-10 rounded-xl border-gray-200 bg-gray-50 focus:bg-white" />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-gray-700 text-sm font-medium">Konfirmasi Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input type={showPass ? "text" : "password"} placeholder="Ulangi password" value={form.confirmPassword}
                  onChange={(e) => field("confirmPassword", e.target.value)} required
                  className="pl-9 rounded-xl border-gray-200 bg-gray-50 focus:bg-white" />
              </div>
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input type="checkbox" id="terms" required className="mt-0.5 rounded border-gray-300 accent-blue-600" />
              <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed">
                Saya setuju dengan <Link to="/terms" className="text-blue-600 hover:underline">syarat & ketentuan</Link> yang berlaku
              </label>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 bg-blue-600 hover:bg-blue-500 rounded-xl mt-2">
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Sudah punya akun? <Link to="/login" className="text-blue-600 hover:underline font-medium">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
