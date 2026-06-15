import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { Mail, Lock, Store, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const from = (location.state as any)?.from?.pathname || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Selamat datang kembali!");
      navigate(from, { replace: true });
    } catch {
      toast.error("Email atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand mark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <Store className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Masuk ke Akun</h1>
          <p className="text-gray-500 text-sm mt-1">Masterpiece Purbalingga</p>
        </div>

        {/* Card */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-gray-700 text-sm font-medium">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="email" type="email" placeholder="nama@example.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required
                  className="pl-9 rounded-xl border-gray-200 bg-gray-50 focus:bg-white" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-gray-700 text-sm font-medium">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input id="password" type={showPass ? "text" : "password"} placeholder="••••••••"
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required
                  className="pl-9 pr-10 rounded-xl border-gray-200 bg-gray-50 focus:bg-white" />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-11 bg-blue-600 hover:bg-blue-500 rounded-xl">
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Belum punya akun?{" "}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">Daftar sekarang</Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="mt-5 bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-xs font-semibold text-blue-800 mb-2">Akun Demo:</p>
          <div className="grid grid-cols-1 gap-2 text-xs text-blue-700">
            <div className="bg-white/60 rounded-lg px-3 py-2">
              <span className="font-medium">Pelanggan:</span> demo@masterpiece.com · demo123
            </div>
            <div className="bg-white/60 rounded-lg px-3 py-2">
              <span className="font-medium">Penjual:</span> jaya@masterpiece.com · seller123
            </div>
            <div className="bg-white/60 rounded-lg px-3 py-2">
              <span className="font-medium">Penjual:</span> exhaustpro@masterpiece.com · seller123
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
