import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Sparkles, BookOpen, Loader2, Check, GraduationCap, AlertCircle, Coins, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import AdInterstitial from "@/components/AdInterstitial";
import Navbar from "@/components/Navbar";
import { useAuth, authAxios } from "@/contexts/AuthContext";
import { API } from "@/config/api";

const AGE_GROUPS = [
  { id: "4-5", name: "4-5 yaş" },
  { id: "6-7", name: "6-7 yaş" },
  { id: "8+", name: "8 yaş ve üstü" },
];

export default function StoryCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [showAd, setShowAd] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);
  
  const [formData, setFormData] = useState({
    topic_id: searchParams.get("topic") || "",
    subtopic_id: searchParams.get("subtopic") || "",
    theme: "",
    age_group: "",
    character: "",
    kazanim_based: true,
  });

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    if (formData.topic_id) {
      fetchSubtopics(formData.topic_id);
    } else {
      setSubtopics([]);
      setSelectedSubtopic(null);
    }
  }, [formData.topic_id]);

  useEffect(() => {
    if (formData.subtopic_id && subtopics.length > 0) {
      const sub = subtopics.find(s => s.id === formData.subtopic_id);
      setSelectedSubtopic(sub || null);
    } else {
      setSelectedSubtopic(null);
    }
  }, [formData.subtopic_id, subtopics]);

  const fetchTopics = async () => {
    try {
      const response = await axios.get(`${API}/topics`);
      setTopics(response.data);
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const fetchSubtopics = async (topicId) => {
    try {
      const response = await axios.get(`${API}/topics/${topicId}/subtopics`);
      setSubtopics(response.data);
    } catch (error) {
      console.error("Error fetching subtopics:", error);
      setSubtopics([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.topic_id || !formData.theme || !formData.age_group) {
      toast.error("Lütfen zorunlu alanları doldurun");
      return;
    }

    // Check credits before proceeding
    if (user?.credits <= 0) {
      toast.error(
        <div className="flex flex-col gap-1">
          <span className="font-bold">Krediniz bitti!</span>
          <span className="text-sm">Profil sayfasından kredi talebi oluşturun.</span>
        </div>,
        {
          duration: 5000,
          action: {
            label: "Profile Git",
            onClick: () => navigate("/profile")
          }
        }
      );
      return;
    }

    // Show interstitial ad before generating
    setShowAd(true);
    setPendingSubmit(true);
  };

  const handleAdClose = async () => {
    setShowAd(false);
    
    if (!pendingSubmit) return;
    setPendingSubmit(false);

    setLoading(true);
    
    try {
      toast.info("Masal oluşturuluyor... Bu işlem 30-60 saniye sürebilir.");
      
      const response = await authAxios.post(`${API}/stories/generate`, formData, {
        timeout: 120000 // 2 minute timeout
      });
      
      toast.success("Masal başarıyla oluşturuldu!");
      
      // Clear stories cache so new story appears
      localStorage.removeItem('masal_stories_cache');
      localStorage.removeItem('masal_popular_cache');
      
      // Refresh user to update credits
      if (isAuthenticated) {
        refreshUser();
      }
      navigate(`/stories/${response.data.id}`);
    } catch (error) {
      console.error("Error creating story:", error);
      if (error.code === "ECONNABORTED") {
        toast.error("İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.");
      } else if (error.response?.status === 402) {
        toast.error("Krediniz bitti! Profil sayfasından kredi talebi oluşturun.");
      } else {
        toast.error(error.response?.data?.detail || "Masal oluşturulurken bir hata oluştu");
      }
    } finally {
      setLoading(false);
    }
  };

  const selectedTopic = topics.find(t => t.id === formData.topic_id);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50 to-white">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">Üyelik Gerekli</h1>
          <p className="text-slate-500 mb-6">
            Masal oluşturmak için üye olmanız veya giriş yapmanız gerekmektedir.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/login">
              <Button className="bg-violet-500 hover:bg-violet-600">Giriş Yap</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline">Kayıt Ol</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50 to-white pb-20 sm:pb-0">
      {/* Interstitial Ad */}
      <AdInterstitial 
        isOpen={showAd} 
        onClose={handleAdClose}
        message="Masalınız hazırlanıyor..."
      />

      {/* Navbar */}
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Credit Warning - More Prominent */}
        {isAuthenticated && user?.credits <= 0 && (
          <div className="mb-6 p-5 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl animate-pulse">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-red-800 font-bold text-lg mb-1">Krediniz Bitti!</h3>
                <p className="text-red-600 text-sm mb-3">
                  Masal oluşturmak için krediniz olması gerekiyor. Her ay 10 ücretsiz kredi yenilenir.
                </p>
                <Link 
                  to="/profile" 
                  className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  <Coins className="w-4 h-4" />
                  Kredi Talep Et
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Low Credit Warning */}
        {isAuthenticated && user?.credits > 0 && user?.credits <= 3 && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
            <div>
              <p className="text-amber-800 font-medium">Krediniz azalıyor! ({user.credits} kredi kaldı)</p>
              <p className="text-amber-600 text-sm">
                Her ay 10 ücretsiz kredi yenilenir veya{" "}
                <Link to="/profile" className="underline">profil sayfasından</Link>{" "}
                ek kredi talep edebilirsiniz.
              </p>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg animate-pulse-glow">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
            Yeni Masal Oluştur
          </h1>
          <p className="text-slate-500 text-lg max-w-md mx-auto">
            Konu ve kazanıma göre kişiselleştirilmiş, eğitici bir masal oluştur
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up stagger-1">
          {/* Topic Selection */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <Label className="form-label text-lg mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm">1</span>
              Ana Konu Seç *
            </Label>
            <Select
              value={formData.topic_id}
              onValueChange={(value) => setFormData({ ...formData, topic_id: value, subtopic_id: "" })}
            >
              <SelectTrigger className="form-select h-14" data-testid="topic-select">
                <SelectValue placeholder="Bir ana konu seçin..." />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                {topics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{topic.name}</span>
                      <span className="text-xs text-slate-400">({topic.subtopic_count} alt konu)</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Subtopic Selection */}
          {formData.topic_id && subtopics.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-slide-up">
              <Label className="form-label text-lg mb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 font-bold text-sm">2</span>
                Alt Konu Seç (Opsiyonel)
              </Label>
              <Select
                value={formData.subtopic_id}
                onValueChange={(value) => setFormData({ ...formData, subtopic_id: value })}
              >
                <SelectTrigger className="form-select h-14" data-testid="subtopic-select">
                  <SelectValue placeholder="Bir alt konu seçin (isteğe bağlı)..." />
                </SelectTrigger>
                <SelectContent className="max-h-80">
                  {subtopics.map((subtopic) => (
                    <SelectItem key={subtopic.id} value={subtopic.id}>
                      {subtopic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Selected Subtopic Kazanım */}
              {selectedSubtopic && (
                <div className="mt-4 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                  <div className="flex items-start gap-2">
                    <GraduationCap className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800">Hedef Kazanım</p>
                      <p className="text-sm text-amber-700 mt-1">{selectedSubtopic.kazanim}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Kazanım Based Toggle */}
          {selectedSubtopic && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 animate-slide-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-violet-500" />
                  <div>
                    <Label className="font-medium text-slate-800">Kazanım Temelli Masal</Label>
                    <p className="text-sm text-slate-500">Masal seçilen kazanımı destekleyecek şekilde yazılsın</p>
                  </div>
                </div>
                <Switch
                  checked={formData.kazanim_based}
                  onCheckedChange={(checked) => setFormData({ ...formData, kazanim_based: checked })}
                  data-testid="kazanim-switch"
                />
              </div>
            </div>
          )}

          {/* Theme Input */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <Label className="form-label text-lg mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-sm">3</span>
              Tema *
            </Label>
            <Input
              type="text"
              placeholder="Örn: Paylaşmanın önemi, Dostluğun değeri, Cesaret"
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
              <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm">4</span>
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
              <span className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-sm">5</span>
              Ana Karakter (Opsiyonel)
            </Label>
            <Input
              type="text"
              placeholder="Örn: Minik Tavşan, Cesur Kız Elif, Meraklı Ayıcık"
              value={formData.character}
              onChange={(e) => setFormData({ ...formData, character: e.target.value })}
              className="form-input h-14"
              data-testid="character-input"
            />
            <p className="text-sm text-slate-400 mt-2">
              Boş bırakırsanız yapay zeka karakter belirler
            </p>
          </div>

          {/* Summary Card */}
          {formData.topic_id && formData.theme && formData.age_group && (
            <div className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl p-6 border border-violet-200 animate-slide-up">
              <h4 className="font-bold text-violet-800 mb-4 flex items-center gap-2">
                <Check className="w-5 h-5" />
                Masal Özeti
              </h4>
              <div className="space-y-2 text-sm">
                <p><span className="text-slate-500">Ana Konu:</span> <span className="font-medium text-slate-700">{selectedTopic?.name}</span></p>
                {selectedSubtopic && (
                  <p><span className="text-slate-500">Alt Konu:</span> <span className="font-medium text-slate-700">{selectedSubtopic.name}</span></p>
                )}
                <p><span className="text-slate-500">Tema:</span> <span className="font-medium text-slate-700">{formData.theme}</span></p>
                <p><span className="text-slate-500">Yaş Grubu:</span> <span className="font-medium text-slate-700">{formData.age_group}</span></p>
                {formData.character && (
                  <p><span className="text-slate-500">Karakter:</span> <span className="font-medium text-slate-700">{formData.character}</span></p>
                )}
                {selectedSubtopic && formData.kazanim_based && (
                  <p><span className="text-slate-500">Kazanım:</span> <span className="font-medium text-amber-700">{selectedSubtopic.kazanim}</span></p>
                )}
              </div>
            </div>
          )}

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
              Alt konu seçerseniz masal daha odaklı olur
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-1">•</span>
              Kazanım temelli masallar pedagojik açıdan daha etkilidir
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-500 mt-1">•</span>
              Yaş grubuna uygun dil ve uzunluk otomatik ayarlanır
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
