import { Link } from "react-router";
import { Store, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Store className="h-6 w-6 text-blue-400" />
              <span className="text-white font-semibold">Masterpiece Purbalingga</span>
            </div>
            <p className="text-sm">
              Destinasi Anda untuk sistem knalpot motor berkualitas dari Purbalingga. Mendukung pengrajin lokal dan melestarikan keahlian tradisional.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Tautan Cepat</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-sm hover:text-blue-400 transition-colors">
                  Beranda
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-sm hover:text-blue-400 transition-colors">
                  Toko
                </Link>
              </li>
              <li>
                <Link to="/seller-signup" className="text-sm hover:text-blue-400 transition-colors font-medium">
                  Jual di Sini
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm hover:text-blue-400 transition-colors">
                  Tentang Kami
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:text-blue-400 transition-colors">
                  Kontak
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hubungi Kami</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>Purbalingga, Central Java, Indonesia</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+62 812-3456-7890</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>info@masterpiecepbg.com</span>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-white font-semibold mb-4">Ikuti Kami</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="hover:text-blue-400 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="hover:text-blue-400 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="hover:text-blue-400 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2026 Masterpiece Purbalingga. Hak cipta dilindungi.</p>
        </div>
      </div>
    </footer>
  );
}
