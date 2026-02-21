import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, ExternalLink, BookOpen, Gift, Star, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AMAZON_TAG = 'masalspace-21';

// Amazon Türkiye affiliate link formatı
// Doğru format: https://www.amazon.com.tr/s?k=ARAMA&tag=TAG_ID
const createAmazonLink = (searchQuery) => {
  const encodedQuery = encodeURIComponent(searchQuery);
  return `https://www.amazon.com.tr/s?k=${encodedQuery}&tag=${AMAZON_TAG}`;
};

// Featured Amazon products for interstitial
const FEATURED_PRODUCTS = [
  {
    title: 'En Çok Satan Masal Kitapları',
    description: 'Çocukların en sevdiği klasik ve yeni masallar',
    searchQuery: 'en çok satan çocuk masal kitabı',
    icon: BookOpen,
    gradient: 'from-violet-500 to-purple-600',
    highlight: true
  },
  {
    title: 'Eğitici Oyuncak Setleri',
    description: 'STEM ve montessori oyuncakları',
    searchQuery: 'eğitici oyuncak set çocuk',
    icon: Gift,
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    title: 'Sesli Masal Kitapları',
    description: 'Butonlu sesli hikaye kitapları',
    searchQuery: 'sesli masal kitabı çocuk',
    icon: Star,
    gradient: 'from-amber-500 to-orange-600'
  }
];

// Interstitial Ad Component with Amazon
export const AdInterstitial = ({ 
  isOpen, 
  onClose, 
  autoCloseDelay = 10000,
  message = "Masalınız hazırlanıyor..."
}) => {
  const countdownSeconds = Math.floor(autoCloseDelay / 1000);
  const [countdown, setCountdown] = useState(countdownSeconds);
  const [canClose, setCanClose] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCountdown(countdownSeconds);
      setCanClose(false);
    }
  }, [isOpen, countdownSeconds]);

  useEffect(() => {
    if (!isOpen || canClose) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, canClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-pink-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">{message}</span>
          </div>
          {canClose ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          ) : (
            <span className="text-white/80 text-sm bg-white/20 px-3 py-1 rounded-full">
              {countdown}s
            </span>
          )}
        </div>

        {/* Amazon Products Content */}
        <div className="p-6">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium">
              <ShoppingBag className="w-4 h-4" />
              Sizin İçin Öneriler
            </div>
          </div>

          <div className="space-y-3">
            {FEATURED_PRODUCTS.map((product, idx) => {
              const Icon = product.icon;
              return (
                <a
                  key={idx}
                  href={createAmazonLink(product.searchQuery)}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all group ${
                    product.highlight 
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 hover:border-amber-400' 
                      : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${product.gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 group-hover:text-orange-600 transition-colors">
                      {product.title}
                    </p>
                    <p className="text-sm text-slate-500 truncate">{product.description}</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-orange-500 flex-shrink-0" />
                </a>
              );
            })}
          </div>
          
          {/* Sponsor text */}
          <p className="text-center text-xs text-slate-400 mt-4 flex items-center justify-center gap-1">
            <img src="https://www.amazon.com.tr/favicon.ico" alt="Amazon" className="w-3 h-3" />
            Amazon iş ortağı bağlantısı
          </p>
        </div>

        {/* Close Button */}
        {canClose && (
          <div className="px-6 pb-6">
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-bold py-3 rounded-full"
            >
              Devam Et
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdInterstitial;
