import Navbar from "@/components/Navbar";
import { FileText, Mail } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50 to-white pb-20 sm:pb-0">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-slate-100">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-pink-500 rounded-2xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Kullanım Koşulları</h1>
              <p className="text-slate-500 text-sm">Son güncelleme: 25 Aralık 2025</p>
            </div>
          </div>

          {/* Content */}
          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">1. Kabul</h2>
              <p className="text-slate-600 mb-4">
                Masal Sepeti (masal.space) platformunu kullanarak, bu kullanım koşullarını kabul etmiş olursunuz. 
                Bu koşulları kabul etmiyorsanız, lütfen platformu kullanmayın.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">2. Hizmet Tanımı</h2>
              <p className="text-slate-600 mb-4">
                Masal Sepeti, yapay zeka destekli çocuk masalları oluşturma ve dinleme platformudur. 
                Kullanıcılar, çeşitli konularda eğitici masallar oluşturabilir ve sesli olarak dinleyebilir.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">3. Hesap Oluşturma</h2>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>Hesap oluşturmak için 18 yaşında olmanız veya ebeveyn/veli izni almanız gerekir</li>
                <li>Doğru ve güncel bilgiler sağlamakla yükümlüsünüz</li>
                <li>Hesap güvenliğinizden siz sorumlusunuz</li>
                <li>Hesabınızı başkalarıyla paylaşmamalısınız</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">4. Kredi Sistemi</h2>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>Yeni kullanıcılara 10 ücretsiz kredi verilir</li>
                <li>Her masal oluşturma 1 kredi harcar</li>
                <li>Krediler aylık olarak yenilenir</li>
                <li>Kullanılmayan krediler bir sonraki aya devretmez</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">5. Kullanım Kuralları</h2>
              <p className="text-slate-600 mb-4">Platformu kullanırken şunları yapmamalısınız:</p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>Yasadışı, zararlı veya uygunsuz içerik oluşturmak</li>
                <li>Platformun güvenliğini tehlikeye atmak</li>
                <li>Otomatik botlar veya scriptler kullanmak</li>
                <li>Diğer kullanıcıları rahatsız etmek</li>
                <li>Fikri mülkiyet haklarını ihlal etmek</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">6. İçerik Hakları</h2>
              <p className="text-slate-600 mb-4">
                Oluşturduğunuz masallar üzerinde kullanım hakkına sahipsiniz. Ancak:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>Masal Sepeti, içerikleri platform içinde kullanma hakkını saklı tutar</li>
                <li>Yapay zeka tarafından üretilen içerikler benzersiz olmayabilir</li>
                <li>Ticari kullanım için ek izin gerekebilir</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">7. İçerik Güvenliği ve Filtreleme</h2>
              <p className="text-slate-600 mb-4">
                Masal Sepeti, çocukların güvenliği için gelişmiş içerik filtreleme sistemleri kullanmaktadır:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li><strong>Otomatik İçerik Filtreleme:</strong> Tüm masal oluşturma istekleri, küfür, uygunsuz kelime ve zararlı içerik açısından otomatik olarak taranır</li>
                <li><strong>Yapay Zeka Moderasyonu:</strong> OpenAI Moderation API ile cinsel içerik, nefret söylemi, şiddet ve taciz içeriği tespit edilir</li>
                <li><strong>Çift Katmanlı Koruma:</strong> Hem kullanıcı girişleri hem de yapay zeka tarafından üretilen içerikler kontrol edilir</li>
                <li><strong>Türkçe Dil Desteği:</strong> Türkçe küfür ve uygunsuz kelimeler için özel filtre uygulanır</li>
              </ul>
              <p className="text-slate-600 mt-4">
                Uygunsuz içerik tespit edildiğinde masal oluşturulmaz ve kullanıcıya bilgi verilir. 
                Bu sistem, platformumuzun çocuklar için güvenli kalmasını sağlar.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">8. Sorumluluk Reddi</h2>
              <p className="text-slate-600 mb-4">
                Masal Sepeti, içeriklerin doğruluğu veya uygunluğu konusunda garanti vermez. 
                Platform "olduğu gibi" sunulmaktadır. Şunlardan sorumlu değiliz:
              </p>
              <ul className="list-disc list-inside text-slate-600 space-y-2 ml-4">
                <li>Hizmet kesintileri</li>
                <li>Veri kaybı</li>
                <li>Üçüncü taraf hizmetlerindeki sorunlar</li>
                <li>Yapay zeka tarafından üretilen içeriklerdeki hatalar</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">9. Hesap Sonlandırma</h2>
              <p className="text-slate-600 mb-4">
                Kullanım koşullarını ihlal etmeniz durumunda hesabınızı askıya alabilir veya 
                sonlandırabiliriz. Hesabınızı istediğiniz zaman silebilirsiniz.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">10. Değişiklikler</h2>
              <p className="text-slate-600 mb-4">
                Bu kullanım koşullarını önceden haber vermeksizin değiştirme hakkını saklı tutarız. 
                Önemli değişiklikler e-posta ile bildirilecektir.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4">11. Uygulanacak Hukuk</h2>
              <p className="text-slate-600 mb-4">
                Bu koşullar Türkiye Cumhuriyeti yasalarına tabidir. Uyuşmazlıklar Türkiye mahkemelerinde çözülecektir.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4">11. İletişim</h2>
              <p className="text-slate-600 mb-4">
                Kullanım koşulları hakkında sorularınız için:
              </p>
              <div className="flex items-center gap-2 text-violet-600">
                <Mail className="w-5 h-5" />
                <a href="mailto:info@masal.space" className="hover:underline">info@masal.space</a>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
