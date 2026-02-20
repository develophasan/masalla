import { ExternalLink, BookOpen, Gift, Star } from 'lucide-react';

const AMAZON_TAG = 'masalspace-21';
const AMAZON_BASE = 'https://www.amazon.com.tr';

// Amazon affiliate link generator
const createAmazonLink = (path, campaignId = '') => {
  const params = new URLSearchParams({
    tag: AMAZON_TAG,
    linkCode: 'll2',
    ref_: 'as_li_ss_tl'
  });
  if (campaignId) params.set('linkId', campaignId);
  return `${AMAZON_BASE}${path}?${params.toString()}`;
};

// Predefined category links for children
const AMAZON_CATEGORIES = {
  cocukKitaplari: {
    name: 'Çocuk Kitapları',
    path: '/s?k=çocuk+kitapları+masal',
    icon: BookOpen,
    color: 'from-orange-400 to-amber-500'
  },
  masalKitaplari: {
    name: 'Masal Kitapları',
    path: '/s?k=masal+kitabı+çocuk',
    icon: BookOpen,
    color: 'from-purple-400 to-violet-500'
  },
  egiticiOyuncaklar: {
    name: 'Eğitici Oyuncaklar',
    path: '/s?k=eğitici+oyuncak+çocuk',
    icon: Gift,
    color: 'from-pink-400 to-rose-500'
  },
  uygulamaKitaplari: {
    name: 'Aktivite Kitapları',
    path: '/s?k=çocuk+aktivite+kitabı',
    icon: Star,
    color: 'from-teal-400 to-cyan-500'
  }
};

// Compact banner for story pages
export function AmazonStoryBanner({ topic }) {
  const searchQuery = topic ? `çocuk+kitabı+${encodeURIComponent(topic)}` : 'çocuk+masal+kitabı';
  const link = createAmazonLink(`/s?k=${searchQuery}`);
  
  return (
    <a 
      href={link}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="block mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl hover:shadow-lg transition-all group"
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div className="flex-grow">
          <p className="text-sm font-semibold text-slate-800 group-hover:text-orange-600 transition-colors">
            📚 Bu masalı sevdiniz mi?
          </p>
          <p className="text-xs text-slate-600">
            Amazon'da benzer çocuk kitaplarını keşfedin
          </p>
        </div>
        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors" />
      </div>
    </a>
  );
}

// Category grid for footer or dedicated section
export function AmazonCategoryGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {Object.entries(AMAZON_CATEGORIES).map(([key, category]) => {
        const Icon = category.icon;
        const link = createAmazonLink(category.path);
        
        return (
          <a
            key={key}
            href={link}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all group"
          >
            <div className={`w-8 h-8 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-orange-600 transition-colors">
              {category.name}
            </span>
          </a>
        );
      })}
    </div>
  );
}

// Simple text link for inline use
export function AmazonTextLink({ children, searchQuery, className = '' }) {
  const link = createAmazonLink(`/s?k=${encodeURIComponent(searchQuery || 'çocuk kitabı')}`);
  
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`text-orange-600 hover:text-orange-700 hover:underline inline-flex items-center gap-1 ${className}`}
    >
      {children}
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}

// Footer section with Amazon recommendations
export function AmazonFooterSection() {
  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-4">
          <img 
            src="https://www.amazon.com.tr/favicon.ico" 
            alt="Amazon" 
            className="w-5 h-5"
          />
          <h3 className="text-sm font-semibold text-slate-800">
            Önerilen Çocuk Kitapları
          </h3>
          <span className="text-xs text-slate-500 ml-auto">Amazon iş ortağı bağlantısı</span>
        </div>
        <AmazonCategoryGrid />
      </div>
    </div>
  );
}

// Large promotional banner
export function AmazonPromoBanner() {
  const link = createAmazonLink('/s?k=en+çok+satan+çocuk+kitapları');
  
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="block p-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl text-white hover:shadow-xl transition-all group"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold mb-1">📚 Amazon'da Çocuk Kitapları</p>
          <p className="text-sm text-orange-100">En çok satan masal ve hikaye kitaplarını keşfedin</p>
        </div>
        <div className="bg-white/20 rounded-full p-3 group-hover:bg-white/30 transition-colors">
          <ExternalLink className="w-6 h-6" />
        </div>
      </div>
    </a>
  );
}

export default {
  AmazonStoryBanner,
  AmazonCategoryGrid,
  AmazonTextLink,
  AmazonFooterSection,
  AmazonPromoBanner,
  AMAZON_TAG,
  createAmazonLink
};
