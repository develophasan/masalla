import Navbar from "@/components/Navbar";
import { Shield, Mail } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50 to-white pb-20 sm:pb-0">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-slate-100">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Gizlilik Politikası</h1>
              <p className="text-slate-500 text-sm">Son güncelleme: 25 Aralık 2025</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">1. Giriş</h2>
              <p className="text-slate-600 mb-4">
                Masal Sepeti ("biz", "bizim" veya "platform") olarak, kullanıcılarımızın gizliliğine büyük önem veriyoruz. 
                Bu Gizlilik Politikası, masal.space web sitesini kullandığınızda kişisel bilgilerinizi nasıl topladığımızı, 
                kullandığımızı ve koruduğumuzu açıklamaktadır.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">2. Topladığımız Bilgiler</h2>
              <p className="text-slate-600 mb-4">Platformumuzda şu bilgileri topluyoruz:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li><strong>Hesap Bilgileri:</strong> Ad, e-posta adresi, telefon numarası (isteğe bağlı)</li>
                <li><strong>Google Hesap Bilgileri:</strong> Google ile giriş yaparsanız ad, e-posta ve profil fotoğrafı</li>
                <li><strong>Kullanım Verileri:</strong> Oluşturulan masallar, dinleme geçmişi, favoriler</li>
                <li><strong>Teknik Veriler:</strong> IP adresi, tarayıcı türü, cihaz bilgileri</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">3. Bilgilerin Kullanımı</h2>
              <p className="text-slate-600 mb-4">Topladığımız bilgileri şu amaçlarla kullanıyoruz:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>Hesabınızı oluşturmak ve yönetmek</li>
                <li>Kişiselleştirilmiş masal deneyimi sunmak</li>
                <li>Platformu geliştirmek ve iyileştirmek</li>
                <li>Müşteri desteği sağlamak</li>
                <li>Güvenlik ve dolandırıcılık önleme</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">4. Bilgi Paylaşımı</h2>
              <p className="text-slate-600 mb-4">
                Kişisel bilgilerinizi üçüncü taraflarla satmıyoruz. Bilgilerinizi yalnızca şu durumlarda paylaşabiliriz:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>Yasal zorunluluklar gerektirdiğinde</li>
                <li>Hizmet sağlayıcılarımızla (sunucu, ödeme işlemcisi vb.)</li>
                <li>Açık izniniz olduğunda</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">5. Çerezler (Cookies)</h2>
              <p className="text-slate-600 mb-4">
                Platformumuz, deneyiminizi iyileştirmek için çerezler kullanır. Çerezler, oturum yönetimi, 
                tercihlerinizi hatırlama ve analitik amaçlarla kullanılır. Tarayıcı ayarlarınızdan çerezleri 
                devre dışı bırakabilirsiniz.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">6. Veri Güvenliği</h2>
              <p className="text-slate-600 mb-4">
                Verilerinizi korumak için endüstri standardı güvenlik önlemleri kullanıyoruz. Bunlar arasında 
                SSL şifreleme, güvenli sunucular ve düzenli güvenlik denetimleri bulunmaktadır.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">7. Çocukların Gizliliği</h2>
              <p className="text-slate-600 mb-4">
                Masal Sepeti, çocuklar için tasarlanmış bir platformdur. Ancak hesap oluşturma işlemi 
                ebeveynler veya veliler tarafından yapılmalıdır. 13 yaş altı çocuklardan bilerek kişisel 
                bilgi toplamıyoruz.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">8. Haklarınız</h2>
              <p className="text-slate-600 mb-4">KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>Kişisel verilerinize erişim hakkı</li>
                <li>Verilerin düzeltilmesini isteme hakkı</li>
                <li>Verilerin silinmesini isteme hakkı</li>
                <li>Veri işlemeye itiraz hakkı</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">9. İletişim</h2>
              <p className="text-slate-600 mb-4">
                Gizlilik politikamız hakkında sorularınız varsa bizimle iletişime geçebilirsiniz:
              </p>
              <div className="flex items-center gap-2 text-violet-600">
                <Mail className="w-5 h-5" />
                <a href="mailto:info@masal.space" className="hover:underline">info@masal.space</a>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">10. Değişiklikler</h2>
              <p className="text-slate-600">
                Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler olduğunda 
                sizi bilgilendireceğiz. Platformu kullanmaya devam etmeniz, güncellenmiş politikayı 
                kabul ettiğiniz anlamına gelir.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
