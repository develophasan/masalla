import { ExternalLink, BookOpen, Gift, Star } from 'lucide-react';

const AMAZON_TAG = 'masalspace-21';

// Amazon affiliate link generator - DOĞRU FORMAT
const createAmazonSearchLink = (searchQuery) => {
  const encodedQuery = encodeURIComponent(searchQuery);
  return `https://www.amazon.com.tr/s?k=${encodedQuery}&tag=${AMAZON_TAG}`;
};

// Predefined category links for children
const AMAZON_CATEGORIES = {
  cocukKitaplari: {
    name: 'Çocuk Kitapları',
    searchQuery: 'çocuk kitapları masal',
    icon: BookOpen,
    color: 'from-orange-400 to-amber-500'
  },
  masalKitaplari: {
    name: 'Masal Kitapları',
    searchQuery: 'masal kitabı çocuk',
    icon: BookOpen,
    color: 'from-purple-400 to-violet-500'
  },
  egiticiOyuncaklar: {
    name: 'Eğitici Oyuncaklar',
    searchQuery: 'eğitici oyuncak çocuk',
    icon: Gift,
    color: 'from-pink-400 to-rose-500'
  },
  uygulamaKitaplari: {
    name: 'Aktivite Kitapları',
    searchQuery: 'çocuk aktivite kitabı',
    icon: Star,
    color: 'from-teal-400 to-cyan-500'
  }
};

// Compact banner for story pages
export function AmazonStoryBanner({ topic }) {
  const searchQuery = topic ? `çocuk kitabı ${topic}` : 'çocuk masal kitabı';
  const link = createAmazonSearchLink(searchQuery);
  
  return (
    <a 
      href={link}
      target="_blank"
      rel="noopener noreferrer"
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
        const link = createAmazonSearchLink(category.searchQuery);
        
        return (
          <a
            key={key}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all group"
          >
            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-slate-700 group-hover:text-orange-600 transition-colors">
              {category.name}
            </span>
          </a>
        );
      })}
    </div>
  );
}

// Large promotional banner
export function AmazonPromoBanner() {
  const link = createAmazonSearchLink('çocuk kitapları eğitici');
  
  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl text-white hover:shadow-xl transition-all group"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold mb-1">
            📚 Çocuklar İçin En İyi Kitaplar
          </p>
          <p className="text-sm text-white/90">
            Amazon'da binlerce eğitici çocuk kitabını keşfedin
          </p>
        </div>
        <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl group-hover:bg-white/30 transition-colors">
          <ExternalLink className="w-6 h-6" />
        </div>
      </div>
    </a>
  );
}

export default { AmazonStoryBanner, AmazonCategoryGrid, AmazonPromoBanner };
