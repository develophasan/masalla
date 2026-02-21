import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  BookOpen, Baby, Puzzle, Palette, Headphones, Laptop, 
  Home, BookMarked, Gift, Star, ExternalLink, Sparkles,
  ChevronRight, Heart, Award, Gamepad2, Music, Lamp,
  GraduationCap, TreePine, Crown, Flame, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";

const AMAZON_TAG = 'masalspace-21';

// Amazon Türkiye arama affiliate link formatı
// Doğru format: https://www.amazon.com.tr/s?k=ARAMA&tag=TAG_ID
const createAmazonLink = (searchQuery) => {
  const encodedQuery = encodeURIComponent(searchQuery);
  return `https://www.amazon.com.tr/s?k=${encodedQuery}&tag=${AMAZON_TAG}`;
};

// Editörün Seçimi - Öne Çıkan Ürünler
const FEATURED_PICKS = [
  {
    title: 'Tübitak Popüler Bilim Kitapları',
    description: 'Bilimi sevdiren en çok satan seriler',
    query: 'tübitak popüler bilim çocuk kitap',
    badge: 'En Çok Satan',
    gradient: 'from-blue-500 to-cyan-500'
  },
  {
    title: 'Tonguç Akademi Okul Öncesi',
    description: 'Eğlenceli okula hazırlık setleri',
    query: 'tonguç akademi okul öncesi',
    badge: 'Popüler',
    gradient: 'from-orange-500 to-red-500'
  },
  {
    title: 'Montessori Aktivite Setleri',
    description: 'Öğrenirken eğlenen çocuklar için',
    query: 'montessori aktivite seti çocuk',
    badge: 'Tavsiye',
    gradient: 'from-emerald-500 to-teal-500'
  },
  {
    title: 'Sesli Masal Projektörü',
    description: 'Uyku öncesi sihirli anlar',
    query: 'çocuk hikaye projektör gece lambası',
    badge: 'Yeni',
    gradient: 'from-purple-500 to-pink-500'
  }
];

const CATEGORIES = [
  {
    id: 'masal-kitaplari',
    title: 'Masal & Hikaye Kitapları',
    description: 'Klasik masallar, modern hikayeler ve resimli çocuk kitapları',
    icon: BookOpen,
    gradient: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-50',
    products: [
      { name: 'En Çok Satan Masal Kitapları', query: 'en çok satan çocuk masal kitabı', highlight: true },
      { name: 'Resimli Hikaye Kitapları', query: 'resimli hikaye kitabı çocuk' },
      { name: 'Klasik Masallar Seti', query: 'klasik masallar çocuk kitap seti' },
      { name: 'Uyku Öncesi Masalları', query: 'uyku öncesi masal kitabı' },
      { name: 'Değerler Eğitimi Kitapları', query: 'çocuk değerler eğitimi kitap' },
      { name: 'İlk Okuma Kitapları', query: 'ilk okuma kitapları çocuk' },
    ]
  },
  {
    id: 'sesli-kitaplar',
    title: 'Sesli Kitaplar & Hikaye Kutuları',
    description: 'Butonlu sesli kitaplar ve interaktif hikaye cihazları',
    icon: Headphones,
    gradient: 'from-pink-500 to-rose-600',
    bgColor: 'bg-pink-50',
    products: [
      { name: 'Sesli Masal Kitapları', query: 'sesli masal kitabı çocuk', highlight: true },
      { name: 'Hikaye Anlatma Makinesi', query: 'hikaye anlatma makinesi çocuk' },
      { name: 'Butonlu Sesli Kitaplar', query: 'butonlu sesli kitap çocuk' },
      { name: 'Müzikli Kitaplar', query: 'müzikli çocuk kitabı' },
      { name: 'Projeksiyon Hikaye Cihazı', query: 'projeksiyon hikaye çocuk' },
    ]
  },
  {
    id: 'egitici-oyuncaklar',
    title: 'Eğitici Oyuncaklar',
    description: 'STEM, Montessori ve gelişim destekleyici oyuncaklar',
    icon: Puzzle,
    gradient: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-50',
    products: [
      { name: 'Montessori Oyuncak Seti', query: 'montessori oyuncak seti', highlight: true },
      { name: 'STEM Eğitim Setleri', query: 'stem eğitim seti çocuk' },
      { name: 'Ahşap Eğitici Oyuncaklar', query: 'ahşap eğitici oyuncak' },
      { name: 'Puzzle & Yapboz', query: 'çocuk puzzle yapboz' },
      { name: 'Blok & Lego Setleri', query: 'çocuk blok lego seti' },
      { name: 'Zeka Oyunları', query: 'çocuk zeka oyunu' },
    ]
  },
  {
    id: 'bebek-urunleri',
    title: 'Bebek Ürünleri (0-2 Yaş)',
    description: 'Bebekler için güvenli kitaplar ve ilk oyuncaklar',
    icon: Baby,
    gradient: 'from-sky-500 to-blue-600',
    bgColor: 'bg-sky-50',
    products: [
      { name: 'Kumaş Bebek Kitapları', query: 'kumaş bebek kitabı', highlight: true },
      { name: 'Banyo Kitapları', query: 'bebek banyo kitabı' },
      { name: 'Sensorik Oyuncaklar', query: 'bebek sensorik oyuncak' },
      { name: 'İlk Yapbozlar', query: 'bebek ilk yapboz' },
      { name: 'Müzikli Bebek Oyuncakları', query: 'müzikli bebek oyuncak' },
      { name: 'Diş Kaşıyıcı Oyuncaklar', query: 'bebek diş kaşıyıcı oyuncak' },
    ]
  },
  {
    id: 'yaraticilik',
    title: 'Yaratıcılık & El İşi',
    description: 'Boyama, çizim ve el becerisi geliştiren aktiviteler',
    icon: Palette,
    gradient: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    products: [
      { name: 'Boyama Kitapları', query: 'çocuk boyama kitabı', highlight: true },
      { name: 'Oyun Hamuru Setleri', query: 'oyun hamuru seti çocuk' },
      { name: 'El İşi & Craft Setleri', query: 'çocuk el işi craft seti' },
      { name: 'Parmak Boyası', query: 'çocuk parmak boyası seti' },
      { name: 'Çizim & Resim Setleri', query: 'çocuk çizim resim seti' },
      { name: 'Boncuk & Takı Setleri', query: 'çocuk boncuk takı seti' },
    ]
  },
  {
    id: 'muzik-hareket',
    title: 'Müzik & Hareket',
    description: 'Müzik aletleri ve aktif oyun ürünleri',
    icon: Music,
    gradient: 'from-fuchsia-500 to-pink-600',
    bgColor: 'bg-fuchsia-50',
    products: [
      { name: 'Çocuk Müzik Aletleri Seti', query: 'çocuk müzik aleti seti', highlight: true },
      { name: 'Çocuk Gitarı', query: 'çocuk gitarı oyuncak' },
      { name: 'Çocuk Piyanosu', query: 'çocuk piyano oyuncak' },
      { name: 'Ritim Aletleri', query: 'çocuk ritim aleti seti' },
      { name: 'Dans & Hareket Oyunları', query: 'çocuk dans hareket oyunu' },
    ]
  },
  {
    id: 'teknoloji',
    title: 'Çocuk Teknolojisi',
    description: 'Güvenli tabletler ve eğitici elektronik cihazlar',
    icon: Laptop,
    gradient: 'from-indigo-500 to-blue-600',
    bgColor: 'bg-indigo-50',
    products: [
      { name: 'Çocuk Tabletleri', query: 'çocuk tablet eğitici', highlight: true },
      { name: 'Eğitici Elektronik Oyuncaklar', query: 'eğitici elektronik oyuncak çocuk' },
      { name: 'Çocuk Akıllı Saati', query: 'çocuk akıllı saat' },
      { name: 'Çocuk Kulaklığı', query: 'çocuk kulaklık güvenli' },
      { name: 'Çocuk Kamerası', query: 'çocuk fotoğraf makinesi' },
    ]
  },
  {
    id: 'cocuk-odasi',
    title: 'Çocuk Odası & Dekorasyon',
    description: 'Çocuk odası mobilyaları ve dekorasyon ürünleri',
    icon: Lamp,
    gradient: 'from-teal-500 to-cyan-600',
    bgColor: 'bg-teal-50',
    products: [
      { name: 'Çocuk Kitaplığı', query: 'çocuk kitaplık raf', highlight: true },
      { name: 'Gece Lambası Projektör', query: 'çocuk gece lambası projektör' },
      { name: 'Çocuk Masa Sandalye', query: 'çocuk çalışma masa sandalye' },
      { name: 'Oyuncak Saklama Kutuları', query: 'çocuk oyuncak saklama kutusu' },
      { name: 'Duvar Sticker & Dekor', query: 'çocuk odası duvar sticker' },
      { name: 'Çocuk Halısı', query: 'çocuk odası halı oyun' },
    ]
  },
  {
    id: 'anne-baba',
    title: 'Anne & Baba Köşesi',
    description: 'Ebeveynlik rehberleri ve aile için kaynaklar',
    icon: Heart,
    gradient: 'from-rose-500 to-red-600',
    bgColor: 'bg-rose-50',
    products: [
      { name: 'Ebeveynlik Kitapları', query: 'ebeveynlik rehber kitap', highlight: true },
      { name: 'Çocuk Gelişimi Kitapları', query: 'çocuk gelişimi kitap' },
      { name: 'Pozitif Disiplin', query: 'pozitif disiplin çocuk yetiştirme' },
      { name: 'Çocuk Psikolojisi', query: 'çocuk psikolojisi kitap' },
      { name: 'Aile Aktivite Kitapları', query: 'aile aktivite oyun kitabı' },
    ]
  },
  {
    id: 'ozel-gunler',
    title: 'Hediye & Özel Günler',
    description: 'Doğum günü ve özel günler için hediye fikirleri',
    icon: Gift,
    gradient: 'from-yellow-500 to-amber-600',
    bgColor: 'bg-yellow-50',
    products: [
      { name: 'Doğum Günü Hediyeleri', query: 'çocuk doğum günü hediye', highlight: true },
      { name: 'Hediye Setleri', query: 'çocuk hediye seti kutu' },
      { name: 'Kişiselleştirilebilir Ürünler', query: 'kişiye özel çocuk hediye' },
      { name: 'Parti Malzemeleri', query: 'çocuk doğum günü parti malzeme' },
      { name: 'Hatıra & Anı Ürünleri', query: 'bebek çocuk hatıra anı' },
    ]
  },
  {
    id: 'okul-oncesi',
    title: 'Okul Öncesi Hazırlık',
    description: 'Alfabe, sayılar, yazı çalışmaları ve okula hazırlık materyalleri',
    icon: GraduationCap,
    gradient: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    products: [
      { name: 'Okula Hazırlık Setleri', query: 'okul öncesi hazırlık seti', highlight: true },
      { name: 'Alfabe Öğrenme Kitapları', query: 'alfabe öğrenme kitabı çocuk' },
      { name: 'Sayı ve Matematik', query: 'okul öncesi sayı matematik çocuk' },
      { name: 'Yazı Çalışma Kitapları', query: 'okul öncesi yazı çalışma defteri' },
      { name: 'Dikkat ve Konsantrasyon', query: 'çocuk dikkat konsantrasyon kitabı' },
      { name: 'İngilizce Başlangıç', query: 'çocuk ingilizce başlangıç kitap' },
    ]
  },
  {
    id: 'dis-mekan',
    title: 'Dış Mekan & Bahçe Oyunları',
    description: 'Açık hava aktiviteleri, bisikletler ve bahçe oyuncakları',
    icon: TreePine,
    gradient: 'from-green-500 to-lime-600',
    bgColor: 'bg-green-50',
    products: [
      { name: 'Çocuk Bisikletleri', query: 'çocuk bisiklet 3-6 yaş', highlight: true },
      { name: 'Scooter & Kaykay', query: 'çocuk scooter kaykay' },
      { name: 'Bahçe Oyun Setleri', query: 'çocuk bahçe oyun seti salıncak' },
      { name: 'Kum Havuzu & Oyuncakları', query: 'çocuk kum havuzu oyuncak seti' },
      { name: 'Top & Spor Oyunları', query: 'çocuk futbol basketbol top seti' },
      { name: 'Su Oyuncakları', query: 'çocuk su oyuncağı havuz' },
    ]
  },
  {
    id: 'karakter-urunler',
    title: 'Karakter & Lisanslı Ürünler',
    description: 'Disney, Peppa Pig, PJ Masks ve sevilen karakterler',
    icon: Crown,
    gradient: 'from-pink-500 to-purple-600',
    bgColor: 'bg-pink-50',
    products: [
      { name: 'Disney Prenses Ürünleri', query: 'disney prenses çocuk', highlight: true },
      { name: 'Peppa Pig Koleksiyonu', query: 'peppa pig çocuk oyuncak kitap' },
      { name: 'PJ Masks Pijamaskeliler', query: 'pj masks pijamaskeliler çocuk' },
      { name: 'Paw Patrol', query: 'paw patrol çocuk oyuncak' },
      { name: 'Frozen Karlar Ülkesi', query: 'frozen karlar ülkesi çocuk' },
      { name: 'Spiderman & Süper Kahramanlar', query: 'spiderman süper kahraman çocuk' },
    ]
  },
];

export default function StorePage() {
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-pink-50 to-white pb-24 sm:pb-8">
      <Helmet>
        <title>Öneri Mağazası | Masal Sepeti</title>
        <meta name="description" content="Çocuklar için en iyi kitaplar, eğitici oyuncaklar ve ebeveynlik ürünleri. 0-6 yaş çocuklar için özenle seçilmiş ürün önerileri." />
        <meta property="og:title" content="Öneri Mağazası | Masal Sepeti" />
        <meta property="og:description" content="Çocuklar için en iyi kitaplar, eğitici oyuncaklar ve ebeveynlik ürünleri." />
      </Helmet>

      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 sm:py-16">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/10 via-pink-500/10 to-amber-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-violet-200 mb-6">
            <Sparkles className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-medium text-violet-700">Özenle Seçilmiş Ürünler</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-violet-600 via-pink-600 to-amber-600 bg-clip-text text-transparent">
              Öneri Mağazası
            </span>
          </h1>
          
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            0-6 yaş çocuklar ve ebeveynler için özenle seçilmiş kitaplar, 
            eğitici oyuncaklar ve gelişim destekleyici ürünler
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-emerald-200">
              <Award className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-slate-700">Güvenilir Markalar</span>
            </div>
            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-200">
              <Star className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-slate-700">Yüksek Puanlı Ürünler</span>
            </div>
          </div>
        </div>
      </section>

      {/* Editörün Seçimi - Featured Picks */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Editörün Seçimi</h2>
            <p className="text-sm text-slate-500">Bu hafta öne çıkan ürünler</p>
          </div>
          <div className="ml-auto flex items-center gap-1 text-amber-600">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">Trend</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_PICKS.map((item, idx) => (
            <a
              key={idx}
              href={createAmazonLink(item.query)}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-5 group-hover:opacity-10 transition-opacity`} />
              
              {/* Badge */}
              <div className="absolute top-3 right-3">
                <span className={`text-xs font-bold px-2 py-1 rounded-full bg-gradient-to-r ${item.gradient} text-white shadow-lg`}>
                  {item.badge}
                </span>
              </div>
              
              {/* Content */}
              <div className="relative p-5">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <Star className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="font-bold text-slate-800 mb-2 group-hover:text-violet-700 transition-colors line-clamp-2">
                  {item.title}
                </h3>
                
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">
                  {item.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Amazon'da İncele</span>
                  <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-violet-500 transition-colors" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-xl font-bold text-slate-800">Tüm Kategoriler</h2>
          <span className="text-sm text-slate-500">({CATEGORIES.length} kategori)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {CATEGORIES.map((category) => {
            const IconComponent = category.icon;
            const isSelected = selectedCategory === category.id;
            
            return (
              <div
                key={category.id}
                className={`group relative rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer
                  ${isSelected ? 'ring-2 ring-violet-500 shadow-lg scale-[1.02]' : 'hover:shadow-lg hover:scale-[1.01]'}
                  ${category.bgColor}`}
                onClick={() => setSelectedCategory(isSelected ? null : category.id)}
              >
                <div className="p-5 sm:p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} 
                    flex items-center justify-center mb-4 shadow-lg`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="font-bold text-slate-800 mb-2 group-hover:text-violet-700 transition-colors">
                    {category.title}
                  </h3>
                  
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {category.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {category.products.length} ürün kategorisi
                    </span>
                    <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-300
                      ${isSelected ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                  </div>
                </div>

                {/* Expanded Products */}
                {isSelected && (
                  <div className="px-5 pb-5 sm:px-6 sm:pb-6 space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent mb-4" />
                    {category.products.map((product, idx) => (
                      <a
                        key={idx}
                        href={createAmazonLink(product.query)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all
                          ${product.highlight 
                            ? 'bg-gradient-to-r from-violet-100 to-pink-100 hover:from-violet-200 hover:to-pink-200' 
                            : 'bg-white/70 hover:bg-white'}
                          hover:shadow-md group/item`}
                      >
                        <div className="flex items-center gap-3">
                          {product.highlight && (
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          )}
                          <span className={`text-sm font-medium ${product.highlight ? 'text-violet-700' : 'text-slate-700'}`}>
                            {product.name}
                          </span>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover/item:text-violet-500 transition-colors" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Info Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gradient-to-r from-violet-600 to-pink-600 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <BookMarked className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Neden Bu Ürünleri Öneriyoruz?</h3>
                <p className="text-white/80 text-sm sm:text-base">
                  Tüm önerilerimiz uzman görüşleri ve ebeveyn yorumları dikkate alınarak hazırlanmıştır.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-amber-300" />
                  <span className="font-semibold">Kalite Garantisi</span>
                </div>
                <p className="text-sm text-white/70">Sadece güvenilir markalar ve yüksek puanlı ürünler</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Baby className="w-5 h-5 text-sky-300" />
                  <span className="font-semibold">Yaşa Uygun</span>
                </div>
                <p className="text-sm text-white/70">0-6 yaş grubu için özel olarak filtrelenmiş ürünler</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-rose-300" />
                  <span className="font-semibold">Ebeveyn Onaylı</span>
                </div>
                <p className="text-sm text-white/70">Binlerce ebeveyn tarafından beğenilen ürünler</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p className="text-xs text-center text-slate-500">
          * Bu sayfa Amazon İş Ortaklığı Programı kapsamında affiliate linkler içermektedir. 
          Linkler üzerinden yapılan alışverişlerden komisyon kazanılabilir. 
          Bu durum ürün fiyatlarını etkilemez.
        </p>
      </section>

      {/* Back to Home */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
        <Link to="/">
          <Button variant="outline" className="rounded-full">
            <Home className="w-4 h-4 mr-2" />
            Ana Sayfaya Dön
          </Button>
        </Link>
      </section>
    </div>
  );
}
