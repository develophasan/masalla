import Navbar from "@/components/Navbar";
import { Scale, Mail, User, Building, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function KVKKPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50 to-white pb-20 sm:pb-0">
      <Helmet>
        <title>KVKK Aydınlatma Metni | Masal Sepeti</title>
        <meta name="description" content="Masal Sepeti KVKK kapsamında kişisel verilerin işlenmesine ilişkin aydınlatma metni." />
      </Helmet>
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-slate-100">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">KVKK Aydınlatma Metni</h1>
              <p className="text-slate-500 text-sm">6698 Sayılı Kişisel Verilerin Korunması Kanunu</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">1. Veri Sorumlusu</h2>
              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-slate-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-slate-800">Hasan Özdemir</p>
                    <p className="text-slate-600 text-sm">Bireysel Yazılım Geliştirici</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 mt-3">
                  <Mail className="w-5 h-5 text-slate-600 mt-0.5" />
                  <div>
                    <p className="text-slate-600 text-sm">info@masal.space</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 mt-3">
                  <Building className="w-5 h-5 text-slate-600 mt-0.5" />
                  <div>
                    <p className="text-slate-600 text-sm">Türkiye</p>
                  </div>
                </div>
              </div>
              <p className="text-slate-600">
                6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında, kişisel verileriniz 
                veri sorumlusu sıfatıyla Masal Sepeti (masal.space) tarafından aşağıda açıklanan kapsamda işlenmektedir.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">2. İşlenen Kişisel Veriler</h2>
              <p className="text-slate-600 mb-4">Platformumuz aracılığıyla aşağıdaki kişisel verileriniz işlenmektedir:</p>
              
              <div className="space-y-3">
                <div className="bg-violet-50 rounded-lg p-4">
                  <h4 className="font-semibold text-violet-800 mb-2">Kimlik Bilgileri</h4>
                  <p className="text-slate-600 text-sm">Ad, soyad</p>
                </div>
                <div className="bg-pink-50 rounded-lg p-4">
                  <h4 className="font-semibold text-pink-800 mb-2">İletişim Bilgileri</h4>
                  <p className="text-slate-600 text-sm">E-posta adresi, telefon numarası (isteğe bağlı)</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-800 mb-2">İşlem Güvenliği Bilgileri</h4>
                  <p className="text-slate-600 text-sm">IP adresi, oturum bilgileri, çerez verileri</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4">
                  <h4 className="font-semibold text-emerald-800 mb-2">Kullanım Verileri</h4>
                  <p className="text-slate-600 text-sm">Oluşturulan masallar, favoriler, dinleme geçmişi</p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">3. Kişisel Verilerin İşlenme Amaçları</h2>
              <p className="text-slate-600 mb-4">Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>Üyelik işlemlerinin gerçekleştirilmesi ve hesap yönetimi</li>
                <li>Platform hizmetlerinin sunulması (masal oluşturma, dinleme vb.)</li>
                <li>Kullanıcı deneyiminin kişiselleştirilmesi</li>
                <li>İletişim faaliyetlerinin yürütülmesi</li>
                <li>Yasal yükümlülüklerin yerine getirilmesi</li>
                <li>Platform güvenliğinin sağlanması</li>
                <li>İstatistiksel analizlerin yapılması</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">4. Kişisel Verilerin Aktarılması</h2>
              <p className="text-slate-600 mb-4">
                Kişisel verileriniz, yukarıda belirtilen amaçların gerçekleştirilmesi doğrultusunda 
                aşağıdaki taraflara aktarılabilmektedir:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>Sunucu ve altyapı hizmeti sağlayıcıları</li>
                <li>Analitik hizmet sağlayıcıları (Google Analytics)</li>
                <li>Ödeme hizmet sağlayıcıları</li>
                <li>Yasal düzenlemeler gereği yetkili kamu kurum ve kuruluşları</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">5. Kişisel Veri Toplamanın Yöntemi ve Hukuki Sebebi</h2>
              <p className="text-slate-600 mb-4">
                Kişisel verileriniz, elektronik ortamda web sitesi ve mobil uygulama üzerinden toplanmaktadır. 
                Bu veriler KVKK'nın 5. ve 6. maddelerinde belirtilen:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>Açık rızanızın bulunması</li>
                <li>Sözleşmenin kurulması veya ifası için gerekli olması</li>
                <li>Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi</li>
                <li>Veri sorumlusunun meşru menfaatleri için zorunlu olması</li>
              </ul>
              <p className="text-slate-600 mt-4">hukuki sebeplerine dayanılarak işlenmektedir.</p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">6. Veri Sahibinin Hakları</h2>
              <p className="text-slate-600 mb-4">
                KVKK'nın 11. maddesi uyarınca, kişisel veri sahibi olarak aşağıdaki haklara sahipsiniz:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
                <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
                <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
                <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
                <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
                <li>KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
                <li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme</li>
                <li>Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara uğramanız hâlinde zararın giderilmesini talep etme</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">7. Başvuru Yöntemi</h2>
              <p className="text-slate-600 mb-4">
                Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki yöntemlerle başvurabilirsiniz:
              </p>
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-slate-700">
                  <strong>E-posta:</strong> info@masal.space
                </p>
                <p className="text-slate-600 text-sm mt-2">
                  Başvurularınız en geç 30 gün içinde ücretsiz olarak sonuçlandırılacaktır. 
                  İşlemin ayrıca bir maliyet gerektirmesi hâlinde, Kişisel Verileri Koruma Kurulunca 
                  belirlenen tarifedeki ücret alınabilir.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">8. Değişiklikler</h2>
              <p className="text-slate-600">
                Bu aydınlatma metni, yasal düzenlemeler veya platform politikalarındaki değişiklikler 
                doğrultusunda güncellenebilir. Güncel metin her zaman bu sayfada yayınlanacaktır.
              </p>
              <p className="text-slate-500 text-sm mt-4">
                Son güncelleme tarihi: {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
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
                to="/cookies" 
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm text-slate-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                Çerez Politikası
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
