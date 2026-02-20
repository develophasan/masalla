// Category Theme Mapping
// Masal kategorilerini CSS tema sınıflarıyla eşleştirir

export const CATEGORY_THEMES = {
  // Doğa & Hayvanlar
  'doga': 'theme-nature',
  'hayvanlar': 'theme-nature',
  'orman': 'theme-nature',
  'nature': 'theme-nature',
  'animals': 'theme-nature',
  
  // Deniz & Su
  'deniz': 'theme-sea',
  'su': 'theme-sea',
  'okyanus': 'theme-sea',
  'sea': 'theme-sea',
  'mermaid': 'theme-sea',
  
  // Macera & Uzay
  'macera': 'theme-adventure',
  'uzay': 'theme-adventure',
  'keşif': 'theme-adventure',
  'adventure': 'theme-adventure',
  'space': 'theme-adventure',
  
  // Aile & Sevgi
  'aile': 'theme-family',
  'sevgi': 'theme-family',
  'anne': 'theme-family',
  'baba': 'theme-family',
  'kardeş': 'theme-family',
  'family': 'theme-family',
  'love': 'theme-family',
  
  // Cesaret & Özgüven
  'cesaret': 'theme-courage',
  'ozguven': 'theme-courage',
  'kahraman': 'theme-courage',
  'courage': 'theme-courage',
  'hero': 'theme-courage',
  
  // Okul & Öğrenme
  'okul': 'theme-school',
  'ogrenme': 'theme-school',
  'egitim': 'theme-school',
  'school': 'theme-school',
  'education': 'theme-school',
  
  // Arkadaşlık & Paylaşım
  'arkadaslik': 'theme-friendship',
  'paylasim': 'theme-friendship',
  'dostluk': 'theme-friendship',
  'friendship': 'theme-friendship',
  'sharing': 'theme-friendship',
  
  // Uyku & Rüya
  'uyku': 'theme-sleep',
  'ruya': 'theme-sleep',
  'gece': 'theme-sleep',
  'sleep': 'theme-sleep',
  'dream': 'theme-sleep',
  
  // Duygular & İfade
  'duygu': 'theme-emotions',
  'duygular': 'theme-emotions',
  'ifade': 'theme-emotions',
  'emotions': 'theme-emotions',
  'feelings': 'theme-emotions',
  
  // Hayal Gücü
  'hayal': 'theme-imagination',
  'fantezi': 'theme-imagination',
  'sihir': 'theme-imagination',
  'buyulu': 'theme-imagination',
  'imagination': 'theme-imagination',
  'magic': 'theme-imagination',
};

// Kategori ID veya isminden tema sınıfını döndür
export const getCategoryTheme = (categoryId, categoryName = '') => {
  if (!categoryId && !categoryName) return 'theme-adventure'; // Default tema
  
  const searchTerm = (categoryId || categoryName).toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
  
  // Direkt eşleşme
  if (CATEGORY_THEMES[searchTerm]) {
    return CATEGORY_THEMES[searchTerm];
  }
  
  // Kısmi eşleşme
  for (const [key, theme] of Object.entries(CATEGORY_THEMES)) {
    if (searchTerm.includes(key) || key.includes(searchTerm)) {
      return theme;
    }
  }
  
  // Varsayılan tema
  return 'theme-adventure';
};

// Tema renklerini doğrudan al (CSS değişkenleri olmadan)
export const THEME_COLORS = {
  'theme-nature': {
    light: '#E0FFF4',
    main: '#56D4A5',
    dark: '#38B583',
    gradient: 'linear-gradient(135deg, #56D4A5 0%, #38B583 100%)',
  },
  'theme-sea': {
    light: '#E0FFFE',
    main: '#40E0D0',
    dark: '#20B2AA',
    gradient: 'linear-gradient(135deg, #40E0D0 0%, #48D1CC 50%, #20B2AA 100%)',
  },
  'theme-adventure': {
    light: '#EDE9FE',
    main: '#8B5CF6',
    dark: '#7C3AED',
    gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 50%, #7C3AED 100%)',
  },
  'theme-family': {
    light: '#FFF1F2',
    main: '#FB7185',
    dark: '#F43F5E',
    gradient: 'linear-gradient(135deg, #FDA4AF 0%, #FB7185 50%, #F43F5E 100%)',
  },
  'theme-courage': {
    light: '#FFF7ED',
    main: '#FB923C',
    dark: '#F97316',
    gradient: 'linear-gradient(135deg, #FDBA74 0%, #FB923C 50%, #F97316 100%)',
  },
  'theme-school': {
    light: '#EFF6FF',
    main: '#3B82F6',
    dark: '#2563EB',
    gradient: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #2563EB 100%)',
  },
  'theme-friendship': {
    light: '#ECFDF5',
    main: '#10B981',
    dark: '#059669',
    gradient: 'linear-gradient(135deg, #34D399 0%, #10B981 50%, #059669 100%)',
  },
  'theme-sleep': {
    light: '#FAF5FF',
    main: '#A855F7',
    dark: '#9333EA',
    gradient: 'linear-gradient(135deg, #C084FC 0%, #A855F7 50%, #9333EA 100%)',
  },
  'theme-emotions': {
    light: '#FFF5F5',
    main: '#F87171',
    dark: '#EF4444',
    gradient: 'linear-gradient(135deg, #FCA5A5 0%, #F87171 50%, #EF4444 100%)',
  },
  'theme-imagination': {
    light: '#F0F9FF',
    main: '#0EA5E9',
    dark: '#0284C7',
    gradient: 'linear-gradient(135deg, #38BDF8 0%, #0EA5E9 50%, #0284C7 100%)',
  },
};

export const getThemeColors = (theme) => {
  return THEME_COLORS[theme] || THEME_COLORS['theme-adventure'];
};

// Rastgele tema seç (çeşitlilik için)
export const getRandomTheme = () => {
  const themes = Object.keys(THEME_COLORS);
  return themes[Math.floor(Math.random() * themes.length)];
};

// Index'e göre tema döndür (tutarlı renk dağılımı için)
export const getThemeByIndex = (index) => {
  const themes = Object.keys(THEME_COLORS);
  return themes[index % themes.length];
};
