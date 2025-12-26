import { Link } from 'react-router-dom';
import { Heart, Mail, Shield, FileText, Info, BookOpen } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-slate-50 to-slate-100 border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img 
                src="/logo.svg" 
                alt="Masal Sepeti" 
                className="h-12 w-auto"
              />
              <div className="flex flex-col leading-tight">
                <span className="text-xl font-black tracking-tight">
                  <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
                    MASAL
                  </span>
                </span>
                <span className="text-xl font-black tracking-tight -mt-1">
                  <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 bg-clip-text text-transparent">
                    SEPETİ
                  </span>
                </span>
              </div>
            </Link>
            <p className="text-slate-600 text-sm max-w-md mb-4">
              Yapay zeka destekli, kazanım temelli eğitici masal platformu. 
              Çocuklarınız için güvenli, eğlenceli ve öğretici masallar oluşturun.
            </p>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <Mail className="w-4 h-4" />
              <a href="mailto:info@masal.space" className="hover:text-violet-600 transition-colors">
                info@masal.space
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-slate-800 mb-4">Hızlı Bağlantılar</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/create" className="flex items-center gap-2 text-slate-600 hover:text-violet-600 transition-colors text-sm">
                  <BookOpen className="w-4 h-4" />
                  Masal Oluştur
                </Link>
              </li>
              <li>
                <Link to="/stories" className="flex items-center gap-2 text-slate-600 hover:text-violet-600 transition-colors text-sm">
                  <BookOpen className="w-4 h-4" />
                  Tüm Masallar
                </Link>
              </li>
              <li>
                <Link to="/about" className="flex items-center gap-2 text-slate-600 hover:text-violet-600 transition-colors text-sm">
                  <Info className="w-4 h-4" />
                  Hakkımızda
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-slate-800 mb-4">Yasal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/privacy" className="flex items-center gap-2 text-slate-600 hover:text-violet-600 transition-colors text-sm">
                  <Shield className="w-4 h-4" />
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link to="/terms" className="flex items-center gap-2 text-slate-600 hover:text-violet-600 transition-colors text-sm">
                  <FileText className="w-4 h-4" />
                  Kullanım Koşulları
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm text-center sm:text-left">
              © {currentYear} Masal Sepeti. Tüm hakları saklıdır.
            </p>
            <p className="flex items-center gap-1 text-slate-500 text-sm">
              <span>Sevgiyle yapıldı</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              <span>Türkiye'den</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
