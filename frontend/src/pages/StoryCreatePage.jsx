import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Sparkles, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TOPICS = [
  { id: "organlar", name: "Organlar", description: "Vücudumuzdaki organları tanıyalım" },
  { id: "degerler", name: "Değerler Eğitimi", description: "Paylaşmak, yardımlaşmak ve dürüstlük" },
  { id: "doga", name: "Doğa", description: "Ormanlar, hayvanlar ve çiçekler" },
  { id: "duygular", name: "Duygular", description: "Mutluluk, üzüntü ve sevgi" },
  { id: "arkadaslik", name: "Arkadaşlık", description: "Dostluk ve birlikte oynama" },
  { id: "saglik", name: "Sağlık", description: "Temizlik, beslenme ve spor" },
];

const AGE_GROUPS = [
  { id: "4-5", name: "4-5 yaş" },
  { id: "6-7", name: "6-7 yaş" },
  { id: "8+", name: "8 yaş ve üstü" },
];

export default function StoryCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    theme: "",
    age_group: "",
    character: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.topic || !formData.theme || !formData.age_group) {
      toast.error("Lütfen zorunlu alanları doldurun");
      return;
    }

    setLoading(true);
    
    try {
      toast.info("Masal oluşturuluyor... Bu işlem 30-60 saniye sürebilir.");
      
      const response = await axios.post(`${API}/stories/generate`, formData, {
        timeout: 120000, // 2 minute timeout
      });
      
      toast.success("Masal başarıyla oluşturuldu!");
      navigate(`/stories/${response.data.id}`);
    } catch (error) {
      console.error("Error creating story:", error);
      if (error.code === "ECONNABORTED") {
        toast.error("İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.");
      } else {
        toast.error(error.response?.data?.detail || "Masal oluşturulurken bir hata oluştu");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50 to-white">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)} 
              className="back-button"
              data-testid="back-button"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Geri</span>
            </button>
            
            <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
              <BookOpen className="w-6 h-6 text-violet-500" />
              <span className="text-xl font-bold text-violet-600">Masal Sepeti</span>
            </Link>
            
            <div className="w-20" /> {/* Spacer */}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Page Header */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg animate-pulse-glow">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
            Yeni Masal Oluştur
          </h1>
          <p className="text-slate-500 text-lg max-w-md mx-auto">
            Yapay zeka ile kişiselleştirilmiş, eğitici bir masal oluştur
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up stagger-1">
          {/* Topic Selection */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <Label className="form-label text-lg mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm">1</span>
              Konu Seç *
            </Label>
            <Select
              value={formData.topic}
              onValueChange={(value) => setFormData({ ...formData, topic: value })}
            >
              <SelectTrigger className="form-select h-14" data-testid="topic-select">
                <SelectValue placeholder="Bir konu seçin..." />
              </SelectTrigger>
              <SelectContent>
                {TOPICS.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    <div>
                      <span className="font-medium">{topic.name}</span>
                      <span className="text-slate-400 ml-2 text-sm">- {topic.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Theme Input */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <Label className="form-label text-lg mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-sm">2</span>
              Tema *
            </Label>
            <Input
              type="text"
              placeholder="Örn: Paylaşmanın önemi, Dostluğun değeri"
              value={formData.theme}
              onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              className="form-input h-14"
              data-testid="theme-input"
            />
            <p className="text-sm text-slate-400 mt-2">
              Masalda işlenmesini istediğiniz ana temayı yazın
            </p>
          </div>

          {/* Age Group Selection */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <Label className="form-label text-lg mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm">3</span>
              Yaş Grubu *
            </Label>
            <Select
              value={formData.age_group}
              onValueChange={(value) => setFormData({ ...formData, age_group: value })}
            >
              <SelectTrigger className="form-select h-14" data-testid="age-select">
                <SelectValue placeholder="Yaş grubu seçin..." />
              </SelectTrigger>
              <SelectContent>
                {AGE_GROUPS.map((age) => (
                  <SelectItem key={age.id} value={age.id}>
                    {age.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Character Input (Optional) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <Label className="form-label text-lg mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">4</span>
              Ana Karakter (Opsiyonel)
            </Label>
            <Input
              type="text"
              placeholder="Örn: Minik Tavşan, Cesur Kız Elif"
              value={formData.character}
              onChange={(e) => setFormData({ ...formData, character: e.target.value })}
              className="form-input h-14"
              data-testid="character-input"
            />
            <p className="text-sm text-slate-400 mt-2">
              Boş bırakırsanız yapay zeka karakter belirler
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full jelly-btn text-xl py-6"
            data-testid="create-story-submit"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Masal Oluşturuluyor...
              </>
            ) : (
              <>
                <Sparkles className="w-6 h-6 mr-2" />
                Masalı Oluştur
              </>
            )}
          </Button>
        </form>

        {/* Loading State Info */}
        {loading && (
          <div className="mt-8 p-6 bg-violet-50 rounded-2xl border border-violet-200 animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="spinner flex-shrink-0" />
              <div>
                <h4 className="font-bold text-violet-800 mb-2">Masalınız hazırlanıyor...</h4>
                <p className="text-violet-600 text-sm">
                  Yapay zeka masalınızı yazıyor ve seslendiriyor. Bu işlem 30-60 saniye sürebilir.
                  Lütfen sayfayı kapatmayın.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
          <h4 className="font-bold text-amber-800 mb-3">İpuçları</h4>
          <ul className="space-y-2 text-sm text-amber-700">
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-1">•</span>
              Temayı ne kadar detaylı yazarsanız, masal o kadar özelleşir
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-1">•</span>
              Yaş grubuna uygun dil ve uzunluk otomatik ayarlanır
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-1">•</span>
              Masallar eğitici ve pedagojik açıdan uygun içerik ile üretilir
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
