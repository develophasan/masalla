import { useState, useEffect } from 'react';
import { Cookie, X, Settings, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true, can't be disabled
    analytics: true,
    advertising: true
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const consentData = {
      essential: true,
      analytics: true,
      advertising: true,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('cookie_consent', JSON.stringify(consentData));
    setIsVisible(false);
  };

  const handleAcceptSelected = () => {
    const consentData = {
      ...preferences,
      essential: true, // Always true
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('cookie_consent', JSON.stringify(consentData));
    setIsVisible(false);
  };

  const handleRejectNonEssential = () => {
    const consentData = {
      essential: true,
      analytics: false,
      advertising: false,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('cookie_consent', JSON.stringify(consentData));
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-purple-600 p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Cookie className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Çerez Kullanımı</h3>
              <p className="text-white/80 text-sm">Deneyiminizi iyileştirmek için çerezler kullanıyoruz</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-slate-600 text-sm mb-4">
            Web sitemizde size en iyi deneyimi sunmak için çerezler kullanıyoruz. 
            Zorunlu çerezler sitenin çalışması için gereklidir. 
            Analitik ve reklam çerezleri ise tercihinize bağlıdır.
          </p>

          {/* Cookie Details (Collapsible) */}
          {showDetails && (
            <div className="space-y-3 mb-4 animate-fade-in">
              {/* Essential */}
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700">Zorunlu Çerezler</span>
                </div>
                <span className="text-xs text-emerald-600 bg-emerald-200 px-2 py-0.5 rounded">Her zaman aktif</span>
              </div>

              {/* Analytics */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-sm font-medium text-slate-700">Analitik Çerezler</span>
                  <p className="text-xs text-slate-500">Site kullanımını anlamamıza yardımcı olur</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
                </label>
              </div>

              {/* Advertising */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-sm font-medium text-slate-700">Reklam Çerezleri</span>
                  <p className="text-xs text-slate-500">Kişiselleştirilmiş reklamlar için</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.advertising}
                    onChange={(e) => setPreferences({ ...preferences, advertising: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
                </label>
              </div>
            </div>
          )}

          {/* Links */}
          <div className="flex gap-4 text-xs text-slate-500 mb-4">
            <Link to="/cookies" className="hover:text-violet-600 underline">Çerez Politikası</Link>
            <Link to="/privacy" className="hover:text-violet-600 underline">Gizlilik Politikası</Link>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button 
              onClick={handleAcceptAll}
              className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
            >
              <Check className="w-4 h-4 mr-1" />
              Tümünü Kabul Et
            </Button>
            
            {showDetails ? (
              <Button 
                onClick={handleAcceptSelected}
                variant="outline"
                className="flex-1"
              >
                Seçilenleri Kabul Et
              </Button>
            ) : (
              <Button 
                onClick={() => setShowDetails(true)}
                variant="outline"
                className="flex-1"
              >
                <Settings className="w-4 h-4 mr-1" />
                Ayarlar
              </Button>
            )}
            
            <Button 
              onClick={handleRejectNonEssential}
              variant="ghost"
              className="text-slate-500 hover:text-slate-700"
            >
              Sadece Zorunlu
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
