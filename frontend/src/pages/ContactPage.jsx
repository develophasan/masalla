import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Mail, User, MessageSquare, Send, CheckCircle, AlertCircle, Phone, MapPin, Github, Twitter, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Helmet } from "react-helmet-async";

const API_URL = import.meta.env.VITE_API_URL || process.env.REACT_APP_BACKEND_URL || '';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState(null); // 'loading', 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        const data = await res.json();
        setErrorMessage(data.detail || 'Bir hata oluştu');
        setStatus('error');
      }
    } catch (error) {
      setErrorMessage('Sunucuya bağlanılamadı');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50 to-white pb-20 sm:pb-0">
      <Helmet>
        <title>İletişim | Masal Sepeti</title>
        <meta name="description" content="Masal Sepeti ile iletişime geçin. Sorularınız, önerileriniz ve geri bildirimleriniz için buradayız." />
      </Helmet>
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">Bizimle İletişime Geçin</h1>
          <p className="text-slate-600 max-w-xl mx-auto">
            Sorularınız, önerileriniz veya geri bildirimleriniz için aşağıdaki formu kullanabilir 
            veya doğrudan e-posta gönderebilirsiniz.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="md:col-span-1 space-y-6">
            {/* Contact Cards */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4">İletişim Bilgileri</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">E-posta</p>
                    <a href="mailto:info@masal.space" className="text-slate-800 hover:text-violet-600 transition-colors">
                      info@masal.space
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Konum</p>
                    <p className="text-slate-800">Türkiye</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Developer Info */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-4">Geliştirici</h3>
              
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="https://avatars.githubusercontent.com/u/18751040?v=4" 
                  alt="Hasan Özdemir"
                  className="w-12 h-12 rounded-full border-2 border-white/20"
                />
                <div>
                  <p className="font-semibold">Hasan Özdemir</p>
                  <p className="text-slate-400 text-sm">Full Stack Developer</p>
                </div>
              </div>

              <div className="flex gap-3">
                <a 
                  href="https://github.com/develophasan" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a 
                  href="https://twitter.com/black4rtsdotco" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a 
                  href="https://instagram.com/ozdmrhassn" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-emerald-800">Hızlı Yanıt</span>
              </div>
              <p className="text-emerald-700 text-sm">
                Mesajlarınıza genellikle 24 saat içinde yanıt veriyoruz.
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6">Mesaj Gönderin</h2>

              {status === 'success' ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Mesajınız Gönderildi!</h3>
                  <p className="text-slate-600 mb-6">En kısa sürede size geri dönüş yapacağız.</p>
                  <Button onClick={() => setStatus(null)} variant="outline">
                    Yeni Mesaj Gönder
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        Adınız Soyadınız *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="pl-10"
                          placeholder="Adınız Soyadınız"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        E-posta Adresiniz *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10"
                          placeholder="ornek@email.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Konu *
                    </label>
                    <select
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="">Konu Seçin</option>
                      <option value="Genel Soru">Genel Soru</option>
                      <option value="Teknik Destek">Teknik Destek</option>
                      <option value="Öneri/Geri Bildirim">Öneri / Geri Bildirim</option>
                      <option value="İş Birliği">İş Birliği Teklifi</option>
                      <option value="KVKK/Veri Talebi">KVKK / Veri Talebi</option>
                      <option value="Diğer">Diğer</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      Mesajınız *
                    </label>
                    <div className="relative">
                      <Textarea
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={5}
                        placeholder="Mesajınızı buraya yazın..."
                        className="resize-none"
                      />
                    </div>
                  </div>

                  {status === 'error' && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      <AlertCircle className="w-5 h-5" />
                      {errorMessage}
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={status === 'loading'}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                  >
                    {status === 'loading' ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Mesajı Gönder
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-slate-500 text-center">
                    Bu formu göndererek{' '}
                    <a href="/privacy" className="text-violet-600 hover:underline">Gizlilik Politikamızı</a>
                    {' '}kabul etmiş olursunuz.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
