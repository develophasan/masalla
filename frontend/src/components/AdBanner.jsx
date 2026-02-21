import { useEffect, useRef, useState } from 'react';
import { ExternalLink, BookOpen, Gift, Star, Sparkles } from 'lucide-react';

const AMAZON_TAG = 'masalspace-21';

// Amazon Türkiye affiliate link formatı
// Doğru format: https://www.amazon.com.tr/s?k=ARAMA&tag=TAG_ID
const createAmazonLink = (searchQuery) => {
  const encodedQuery = encodeURIComponent(searchQuery);
  return `https://www.amazon.com.tr/s?k=${encodedQuery}&tag=${AMAZON_TAG}`;
};

// Amazon banner products
const AMAZON_PRODUCTS = [
  {
    title: 'Çocuk Masal Kitapları',
    description: 'En sevilen masallar',
    searchQuery: 'çocuk masal kitabı set',
    icon: BookOpen,
    gradient: 'from-purple-500 to-violet-600'
  },
  {
    title: 'Eğitici Oyuncaklar',
    description: 'Öğrenirken eğlenin',
    searchQuery: 'eğitici oyuncak çocuk 3-6 yaş',
    icon: Gift,
    gradient: 'from-pink-500 to-rose-600'
  },
  {
    title: 'Uyku Arkadaşları',
    description: 'Yumuşak peluşlar',
    searchQuery: 'çocuk peluş oyuncak uyku',
    icon: Star,
    gradient: 'from-amber-500 to-orange-600'
  },
  {
    title: 'Boyama Kitapları',
    description: 'Yaratıcılığı geliştir',
    searchQuery: 'çocuk boyama kitabı aktivite',
    icon: Sparkles,
    gradient: 'from-teal-500 to-cyan-600'
  }
];

// AdSense with Amazon Fallback Banner
export const AdBanner = ({ slot = "auto", className = "", variant = "horizontal" }) => {
  const adRef = useRef(null);
  const [adLoaded, setAdLoaded] = useState(false);
  const [showAmazon, setShowAmazon] = useState(true);

  useEffect(() => {
    // Try to load AdSense
    const timer = setTimeout(() => {
      if (adRef.current) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          // Check if ad actually rendered
          setTimeout(() => {
            const adElement = adRef.current?.querySelector('ins');
            if (adElement && adElement.getAttribute('data-ad-status') === 'filled') {
              setAdLoaded(true);
              setShowAmazon(false);
            }
          }, 1000);
        } catch (e) {
          console.log('AdSense not available, showing Amazon');
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Always show Amazon for now (until AdSense is approved)
  const displayAmazon = showAmazon || !adLoaded;

  if (displayAmazon) {
    // Horizontal variant - show 4 products in a row
    if (variant === "horizontal") {
      return (
        <div className={`ad-container ${className}`}>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                📚 Önerilen Ürünler
              </span>
              <span className="text-xs text-slate-400">Sponsorlu</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {AMAZON_PRODUCTS.map((product, idx) => {
                const Icon = product.icon;
                return (
                  <a
                    key={idx}
                    href={createAmazonLink(product.searchQuery)}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="flex items-center gap-2 p-2 bg-white rounded-lg hover:shadow-md transition-all group"
                  >
                    <div className={`w-8 h-8 bg-gradient-to-br ${product.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-slate-800 truncate group-hover:text-orange-600">{product.title}</p>
                      <p className="text-xs text-slate-500 truncate">{product.description}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    // Vertical/Rectangle variant
    return (
      <div className={`ad-container ${className}`}>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
          <div className="text-center mb-3">
            <span className="text-sm font-bold text-slate-800">📚 Amazon'da Çocuk Ürünleri</span>
          </div>
          <div className="space-y-2">
            {AMAZON_PRODUCTS.slice(0, 3).map((product, idx) => {
              const Icon = product.icon;
              return (
                <a
                  key={idx}
                  href={createAmazonLink(product.searchQuery)}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-all group"
                >
                  <div className={`w-10 h-10 bg-gradient-to-br ${product.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-800 group-hover:text-orange-600">{product.title}</p>
                    <p className="text-xs text-slate-500">{product.description}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-orange-500" />
                </a>
              );
            })}
          </div>
          <p className="text-center text-xs text-slate-400 mt-3">Amazon iş ortağı bağlantısı</p>
        </div>
      </div>
    );
  }

  // AdSense (when approved)
  return (
    <div className={`ad-container ${className}`} ref={adRef}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-7470017453637950"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;
