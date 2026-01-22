import Navbar from "@/components/Navbar";
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Code, Copy, Check, Lock, Smartphone, Server, Key, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const API_BASE = "https://masal.space/api";

const API_ENDPOINTS = [
  {
    category: "🔐 Kimlik Doğrulama",
    endpoints: [
      { method: "POST", path: "/auth/register", desc: "Yeni kullanıcı kaydı", auth: false, body: '{"name": "Ad", "email": "email@test.com", "password": "123456"}' },
      { method: "POST", path: "/auth/login", desc: "Kullanıcı girişi", auth: false, body: '{"email": "email@test.com", "password": "123456"}', response: '{"user": {...}, "session_token": "xxx"}' },
      { method: "POST", path: "/auth/google/session", desc: "Google OAuth girişi", auth: false, body: '{"code": "auth_code", "redirect_uri": "..."}' },
      { method: "GET", path: "/auth/me", desc: "Mevcut kullanıcı bilgisi", auth: true },
      { method: "POST", path: "/auth/logout", desc: "Çıkış yap", auth: true },
    ]
  },
  {
    category: "📚 Konular",
    endpoints: [
      { method: "GET", path: "/topics", desc: "Tüm ana konuları listele", auth: false },
      { method: "GET", path: "/topics/{topic_id}", desc: "Konu detayı", auth: false },
      { method: "GET", path: "/topics/{topic_id}/subtopics", desc: "Alt konuları listele", auth: false },
      { method: "GET", path: "/subtopics/all", desc: "Tüm alt konular", auth: false },
      { method: "GET", path: "/kazanim/search?q=...", desc: "Kazanım ara", auth: false },
    ]
  },
  {
    category: "📖 Masallar",
    endpoints: [
      { method: "GET", path: "/stories", desc: "Tüm masalları listele", auth: false, params: "?limit=20&skip=0&topic_id=xxx&search=xxx" },
      { method: "GET", path: "/stories/popular", desc: "Popüler masallar", auth: false },
      { method: "GET", path: "/masal/{slug}", desc: "Masal detayı (SEO URL)", auth: false },
      { method: "GET", path: "/stories/{story_id}", desc: "Masal detayı (ID ile)", auth: false },
      { method: "POST", path: "/stories/generate", desc: "Yeni masal oluştur", auth: true, body: '{"topic_id": "xxx", "theme": "macera", "age_group": "4-6", "character": "tavşan"}' },
      { method: "POST", path: "/stories/{story_id}/play", desc: "Dinlenme sayısını artır", auth: false },
      { method: "DELETE", path: "/stories/{story_id}", desc: "Masal sil", auth: true },
    ]
  },
  {
    category: "👤 Kullanıcı",
    endpoints: [
      { method: "GET", path: "/users/profile", desc: "Profil bilgisi", auth: true },
      { method: "PUT", path: "/users/profile", desc: "Profil güncelle", auth: true, body: '{"name": "Yeni Ad", "phone": "555..."}' },
      { method: "GET", path: "/users/stories", desc: "Kullanıcının masalları", auth: true },
      { method: "GET", path: "/users/public/{user_id}", desc: "Herkese açık profil", auth: false },
    ]
  },
  {
    category: "❤️ Favoriler",
    endpoints: [
      { method: "GET", path: "/favorites", desc: "Favori masalları listele", auth: true },
      { method: "POST", path: "/favorites/{story_id}", desc: "Favorilere ekle", auth: true },
      { method: "DELETE", path: "/favorites/{story_id}", desc: "Favorilerden çıkar", auth: true },
      { method: "GET", path: "/favorites/check/{story_id}", desc: "Favori mi kontrol et", auth: true },
    ]
  },
  {
    category: "💰 Krediler",
    endpoints: [
      { method: "GET", path: "/credits/balance", desc: "Kredi bakiyesi", auth: true },
      { method: "POST", path: "/credits/request", desc: "Kredi talep et", auth: true, body: '{"reason": "Daha fazla masal oluşturmak istiyorum"}' },
    ]
  },
];

export default function ApiDocsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [copiedPath, setCopiedPath] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Secret key check
  const secretKey = searchParams.get("key");
  const VALID_KEY = "masal2025dev";

  useEffect(() => {
    if (secretKey === VALID_KEY) {
      setIsAuthorized(true);
      // Expand all categories by default
      const expanded = {};
      API_ENDPOINTS.forEach((cat, i) => expanded[i] = true);
      setExpandedCategories(expanded);
    }
  }, [secretKey]);

  const copyToClipboard = (text, path) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(path);
    toast.success("Kopyalandı!");
    setTimeout(() => setCopiedPath(null), 2000);
  };

  const toggleCategory = (index) => {
    setExpandedCategories(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
        <div className="text-center">
          <Lock className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Erişim Engellendi</h1>
          <p className="text-slate-400">Bu sayfa sadece geliştiriciler içindir.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Masal Sepeti API</h1>
              <p className="text-slate-400">Android Uygulama Geliştirici Dokümantasyonu</p>
            </div>
          </div>

          {/* Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <Server className="w-6 h-6 text-violet-400 mb-2" />
              <p className="text-slate-400 text-sm">Base URL</p>
              <code className="text-green-400 text-sm">{API_BASE}</code>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <Key className="w-6 h-6 text-amber-400 mb-2" />
              <p className="text-slate-400 text-sm">Auth Header</p>
              <code className="text-green-400 text-sm">Authorization: Bearer TOKEN</code>
            </div>
            <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
              <Smartphone className="w-6 h-6 text-blue-400 mb-2" />
              <p className="text-slate-400 text-sm">Content-Type</p>
              <code className="text-green-400 text-sm">application/json</code>
            </div>
          </div>
        </div>

        {/* Android Example */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">📱 Android Retrofit Örneği</h2>
          <pre className="bg-slate-900 rounded-lg p-4 overflow-x-auto text-sm">
            <code className="text-green-400">{`// build.gradle
implementation 'com.squareup.retrofit2:retrofit:2.9.0'
implementation 'com.squareup.retrofit2:converter-gson:2.9.0'

// ApiService.kt
interface MasalApiService {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>
    
    @GET("stories")
    suspend fun getStories(@Query("limit") limit: Int = 20): Response<List<Story>>
    
    @POST("stories/generate")
    suspend fun generateStory(
        @Header("Authorization") token: String,
        @Body request: StoryRequest
    ): Response<Story>
}

// Retrofit Instance
val retrofit = Retrofit.Builder()
    .baseUrl("${API_BASE}/")
    .addConverterFactory(GsonConverterFactory.create())
    .build()

val api = retrofit.create(MasalApiService::class.java)`}</code>
          </pre>
        </div>

        {/* API Endpoints */}
        <div className="space-y-4">
          {API_ENDPOINTS.map((category, catIndex) => (
            <div key={catIndex} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <button
                onClick={() => toggleCategory(catIndex)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-750 transition-colors"
              >
                <h2 className="text-lg font-bold text-white">{category.category}</h2>
                {expandedCategories[catIndex] ? (
                  <ChevronDown className="w-5 h-5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                )}
              </button>
              
              {expandedCategories[catIndex] && (
                <div className="border-t border-slate-700">
                  {category.endpoints.map((endpoint, endIndex) => (
                    <div key={endIndex} className="px-6 py-4 border-b border-slate-700 last:border-b-0 hover:bg-slate-750">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                              endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                              endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                              endpoint.method === 'PUT' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {endpoint.method}
                            </span>
                            <code className="text-slate-300 text-sm">{endpoint.path}</code>
                            {endpoint.auth && (
                              <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded text-xs">
                                🔐 Auth
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400 text-sm">{endpoint.desc}</p>
                          {endpoint.body && (
                            <div className="mt-2">
                              <p className="text-slate-500 text-xs mb-1">Request Body:</p>
                              <code className="text-xs text-amber-400 bg-slate-900 px-2 py-1 rounded block overflow-x-auto">
                                {endpoint.body}
                              </code>
                            </div>
                          )}
                          {endpoint.params && (
                            <div className="mt-2">
                              <p className="text-slate-500 text-xs mb-1">Query Params:</p>
                              <code className="text-xs text-cyan-400">{endpoint.params}</code>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(`${API_BASE}${endpoint.path}`, endpoint.path)}
                          className="text-slate-400 hover:text-white"
                        >
                          {copiedPath === endpoint.path ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <p className="text-amber-400 text-sm">
            ⚠️ <strong>Önemli:</strong> Bu dokümantasyon sadece geliştirici kullanımı içindir. 
            API anahtarınızı veya session token'ınızı kimseyle paylaşmayın.
          </p>
        </div>
      </div>
    </div>
  );
}
