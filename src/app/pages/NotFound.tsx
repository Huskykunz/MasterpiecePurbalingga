import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-bold text-blue-600 mb-2">404</p>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-8 max-w-xs mx-auto">Halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
        <Link to="/">
          <Button className="bg-blue-600 hover:bg-blue-500 rounded-xl">
            <Home className="mr-2 h-4 w-4" />
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  );
}
