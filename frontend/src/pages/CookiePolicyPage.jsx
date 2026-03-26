import Navbar from "@/components/Navbar";
import { Cookie, Settings, BarChart3, Shield, ExternalLink, FileText, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50 to-white pb-20 sm:pb-0">
      <Helmet>
        <title>Çerez Politikası | Masal Sepeti</title>
        <meta name="description" content="Masal Sepeti çerez kullanımı hakkında bilgilendirme." />
      </Helmet>
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-slate-100">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center">
              <Cookie className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Çerez Politikası</h1>
              <p className="text-slate-500 text-sm">Son güncelleme: {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Çerez Nedir?</h2>
              <p className="text-slate-600 mb-4">
                Çerezler, web sitelerinin tarayıcınıza yerleştirdiği küçük metin dosyalarıdır. 
                Bu dosyalar, siteyi bir sonraki ziyaretinizde sizi tanımak, tercihlerinizi hatırlamak 
                ve size daha iyi bir kullanıcı deneyimi sunmak için kullanılır.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Kullandığımız Çerez Türleri</h2>
              
              <div className="space-y-4">
                {/* Essential Cookies */}
                <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-emerald-800">Zorunlu Çerezler</h3>
                      <span className="text-xs text-emerald-600 bg-emerald-200 px-2 py-0.5 rounded">Her zaman aktif</span>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mb-3">
                    Bu çerezler, web sitesinin düzgün çalışması için gereklidir ve kapatılamaz.
                  </p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-emerald-200">
                        <th className="text-left py-2 text-slate-700">Çerez Adı</th>
                        <th className="text-left py-2 text-slate-700">Amaç</th>
                        <th className="text-left py-2 text-slate-700">Süre</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600">
                      <tr className="border-b border-emerald-100">
                        <td className="py-2 font-mono text-xs">session_token</td>
                        <td className="py-2">Oturum yönetimi</td>
                        <td className="py-2">Oturum</td>
                      </tr>
                      <tr className="border-b border-emerald-100">
                        <td className="py-2 font-mono text-xs">user_preferences</td>
                        <td className="py-2">Kullanıcı tercihleri</td>
                        <td className="py-2">1 yıl</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-xs">cookie_consent</td>
                        <td className="py-2">Çerez izni durumu</td>
                        <td className="py-2">1 yıl</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Analytics Cookies */}
                <div className="border border-blue-200 bg-blue-50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-blue-800">Analitik Çerezler</h3>
                      <span className="text-xs text-blue-600 bg-blue-200 px-2 py-0.5 rounded">İsteğe bağlı</span>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mb-3">
                    Web sitemizin nasıl kullanıldığını anlamamıza yardımcı olur. Tüm veriler anonim olarak toplanır.
                  </p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-blue-200">
                        <th className="text-left py-2 text-slate-700">Çerez Adı</th>
                        <th className="text-left py-2 text-slate-700">Sağlayıcı</th>
                        <th className="text-left py-2 text-slate-700">Süre</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600">
                      <tr className="border-b border-blue-100">
                        <td className="py-2 font-mono text-xs">_ga</td>
                        <td className="py-2">Google Analytics</td>
                        <td className="py-2">2 yıl</td>
                      </tr>
                      <tr className="border-b border-blue-100">
                        <td className="py-2 font-mono text-xs">_ga_*</td>
                        <td className="py-2">Google Analytics</td>
                        <td className="py-2">2 yıl</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-xs">_gid</td>
                        <td className="py-2">Google Analytics</td>
                        <td className="py-2">24 saat</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Advertising Cookies */}
                <div className="border border-purple-200 bg-purple-50 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-purple-800">Reklam ve Pazarlama Çerezleri</h3>
                      <span className="text-xs text-purple-600 bg-purple-200 px-2 py-0.5 rounded">İsteğe bağlı</span>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mb-3">
                    Size ilgi alanlarınıza göre reklamlar göstermek için kullanılır.
                  </p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-purple-200">
                        <th className="text-left py-2 text-slate-700">Çerez Adı</th>
                        <th className="text-left py-2 text-slate-700">Sağlayıcı</th>
                        <th className="text-left py-2 text-slate-700">Süre</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-600">
                      <tr className="border-b border-purple-100">
                        <td className="py-2 font-mono text-xs">__gads</td>
                        <td className="py-2">Google AdSense</td>
                        <td className="py-2">13 ay</td>
                      </tr>
                      <tr>
                        <td className="py-2 font-mono text-xs">__gpi</td>
                        <td className="py-2">Google AdSense</td>
                        <td className="py-2">13 ay</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Çerezleri Nasıl Yönetebilirsiniz?</h2>
              <p className="text-slate-600 mb-4">
                Çerez tercihlerinizi dilediğiniz zaman değiştirebilirsiniz:
              </p>
              
              <div className="bg-slate-50 rounded-xl p-5 mb-4">
                <h4 className="font-semibold text-slate-800 mb-3">Tarayıcı Ayarları</h4>
                <p className="text-slate-600 text-sm mb-3">
                  Tarayıcınızın ayarlarından çerezleri engelleyebilir veya silebilirsiniz:
                </p>
                <ul className="space-y-2 text-sm">
                  <li>
                    <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 flex items-center gap-1">
                      Chrome <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>
                    <a href="https://support.mozilla.org/tr/kb/cerezleri-silme" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 flex items-center gap-1">
                      Firefox <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>
                    <a href="https://support.apple.com/tr-tr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 flex items-center gap-1">
                      Safari <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>
                    <a href="https://support.microsoft.com/tr-tr/microsoft-edge/microsoft-edge-de-çerezleri-silme-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:text-violet-700 flex items-center gap-1">
                      Edge <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-amber-800 text-sm">
                  <strong>Not:</strong> Zorunlu çerezleri devre dışı bırakırsanız, web sitesinin 
                  bazı özellikleri düzgün çalışmayabilir.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Üçüncü Taraf Çerezleri</h2>
              <p className="text-slate-600 mb-4">
                Web sitemizde aşağıdaki üçüncü taraf hizmetleri kullanılmaktadır:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li><strong>Google Analytics:</strong> Web sitesi trafiğini ve kullanıcı davranışlarını analiz etmek için</li>
                <li><strong>Google AdSense:</strong> Reklam gösterimi için (onay bekliyor)</li>
                <li><strong>Amazon Associates:</strong> Affiliate ürün önerileri için</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">İletişim</h2>
              <p className="text-slate-600">
                Çerez politikamız hakkında sorularınız için bizimle iletişime geçebilirsiniz:
              </p>
              <p className="text-slate-600 mt-2">
                <strong>E-posta:</strong> info@masal.space
              </p>
            </section>

            {/* Related Links */}
            <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-200">
              <Link 
                to="/privacy" 
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Gizlilik Politikası
              </Link>
              <Link 
                to="/kvkk" 
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                KVKK Aydınlatma Metni
              </Link>
              <Link 
                to="/contact" 
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
              >
                <Mail className="w-4 h-4" />
                İletişim
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
