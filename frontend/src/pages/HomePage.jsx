import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { 
  Search, Plus, BookOpen, Star, Sparkles, Heart, Leaf, Smile, 
  Users, Activity, Shield, Rocket, Palette, GraduationCap, 
  Cat, BookMarked, Baby
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TopicCard from "@/components/TopicCard";
import StoryCard from "@/components/StoryCard";
import AdBanner from "@/components/AdBanner";
import Navbar from "@/components/Navbar";
import HowToCreateStory from "@/components/HowToCreateStory";
import LoadingSpinner from "@/components/LoadingSpinner";
import WelcomeModal from "@/components/WelcomeModal";
import { useTopics, usePopularStories } from "@/hooks/useStories";

const TOPIC_ICONS = {
  heart: Heart,
  star: Star,
  leaf: Leaf,
  smile: Smile,
  users: Users,
  activity: Activity,
  shield: Shield,
  rocket: Rocket,
  palette: Palette,
  book: GraduationCap,
  cat: Cat,
  school: GraduationCap,
  "heart-handshake": Heart,
  sparkles: Sparkles,
  bookmark: BookMarked,
};

const TOPIC_COLORS = {
  rose: "from-rose-400 to-pink-500",
  emerald: "from-emerald-400 to-green-500",
  amber: "from-amber-400 to-orange-500",
  violet: "from-violet-400 to-purple-500",
  pink: "from-pink-400 to-rose-500",
  sky: "from-sky-400 to-blue-500",
  orange: "from-orange-400 to-red-500",
  teal: "from-teal-400 to-cyan-500",
  indigo: "from-indigo-400 to-blue-500",
  purple: "from-purple-400 to-violet-500",
  cyan: "from-cyan-400 to-teal-500",
  fuchsia: "from-fuchsia-400 to-pink-500",
  red: "from-red-400 to-rose-500",
  lime: "from-lime-400 to-green-500",
  slate: "from-slate-400 to-gray-500",
};

export default function HomePage() {
  // React Query hooks - automatically cached and synced
  const { data: topics = [], isLoading: topicsLoading } = useTopics();
  const { data: popularStories = [], isLoading: storiesLoading } = usePopularStories(6);
  
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const loading = topicsLoading && storiesLoading;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/stories?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleTopicClick = (topicId) => {
    navigate(`/topics/${topicId}`);
  };

  // Schema.org structured data for homepage
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Masal Sepeti",
    "url": "https://masal.space",
    "logo": "https://masal.space/icons/icon-512x512.png",
    "description": "Çocuklar için yapay zeka destekli, kazanım temelli eğitici masal platformu",
    "sameAs": []
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Masal Sepeti",
    "url": "https://masal.space",
    "description": "Çocuklar için yapay zeka destekli eğitici masallar",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://masal.space/stories?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const educationalOrgSchema = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": "Masal Sepeti",
    "url": "https://masal.space",
    "description": "4-8 yaş çocuklar için pedagojik kazanım destekli sesli masal platformu",
    "educationalCredentialAwarded": "Çocuk gelişimi ve değer eğitimi"
  };

  return (
    <div className="min-h-screen pb-20 sm:pb-0 cloud-bg-animated">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>Masal Sepeti - Çocuklar için Eğitici Sesli Masallar | masal.space</title>
        <meta name="description" content="Yapay zeka destekli, kazanım temelli eğitici masal platformu. 15 ana kategori, 150+ alt konu ile çocuklarınız için özel masallar oluşturun. Ücretsiz sesli masallar." />
        <meta name="keywords" content="çocuk masalları, eğitici masallar, sesli masal, yapay zeka masal, Türkçe masallar, uyku masalları, değer eğitimi, okul öncesi" />
        <link rel="canonical" href="https://masal.space" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Masal Sepeti - Çocuklar için Eğitici Sesli Masallar" />
        <meta property="og:description" content="Yapay zeka destekli, kazanım temelli eğitici masal platformu. Çocuklarınız için özel masallar oluşturun." />
        <meta property="og:url" content="https://masal.space" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://masal.space/icons/icon-512x512.png" />
        <meta property="og:locale" content="tr_TR" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Masal Sepeti - Çocuklar için Eğitici Masallar" />
        <meta name="twitter:description" content="Yapay zeka destekli, kazanım temelli eğitici masal platformu" />
        <meta name="twitter:image" content="https://masal.space/icons/icon-512x512.png" />

        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(organizationSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(educationalOrgSchema)}
        </script>
      </Helmet>

      {/* Welcome Modal for First Time Visitors */}
      <WelcomeModal />
      
      {/* Navbar */}
      <Navbar />

      {/* Hero Section - Cloud Dancer Style */}
      <section className="relative overflow-hidden py-12 md:py-20">
        {/* Floating Gradient Orbs - Hidden on mobile via CSS */}
        <div className="hidden md:block absolute top-20 left-[10%] w-72 h-72 bg-gradient-to-br from-violet-400/30 to-fuchsia-400/20 rounded-full blur-3xl float pointer-events-none" />
        <div className="hidden md:block absolute bottom-10 right-[5%] w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-teal-400/20 rounded-full blur-3xl float float-delay-1 pointer-events-none" />
        <div className="hidden md:block absolute top-40 right-[20%] w-48 h-48 bg-gradient-to-br from-amber-400/25 to-orange-400/20 rounded-full blur-3xl float float-delay-2 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 glass-card px-5 py-2.5 mb-6 animate-slide-up">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-slate-700">15 Ana Kategori • 150+ Alt Konu • Kazanım Destekli</span>
            </div>
            
            {/* Hero Logo */}
            <div className="flex justify-center mb-4 animate-slide-up">
              <img 
                src="/logo.svg" 
                alt="Masal Sepeti" 
                className="h-28 md:h-36 w-auto drop-shadow-lg"
              />
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-4 animate-slide-up stagger-1 tracking-tight">
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">Masal</span>{" "}
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 bg-clip-text text-transparent">Sepeti</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 mb-8 animate-slide-up stagger-2 max-w-2xl mx-auto">
              Konu seç, kazanım belirle, masalı dinle! Çocuklarınız için pedagojik temelli eğitici masallar.
            </p>

            {/* Search Box - Glassmorphism */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto animate-slide-up stagger-3">
              <div className="glass-card-strong p-2 rounded-2xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Masal veya kazanım ara... (örn: empati, paylaşma)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-32 py-5 text-lg bg-transparent border-none focus:ring-0 rounded-xl"
                    data-testid="search-input"
                  />
                  <Button 
                    type="submit" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 rounded-xl px-6 py-2 shadow-lg hover:shadow-xl transition-all"
                    data-testid="search-button"
                  >
                    Ara
                  </Button>
                </div>
              </div>
            </form>

            {/* Quick Create Button (Mobile) */}
            <Link to="/create" className="sm:hidden mt-8 inline-block" data-testid="create-story-mobile-btn">
              <Button className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white rounded-full px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>Yeni Masal Oluştur</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How to Create Story Guide */}
      <section className="py-12 md:py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <HowToCreateStory />
        </div>
      </section>

      {/* Topics Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
              Konu Havuzu
            </h2>
            <p className="text-slate-500 text-lg">15 ana kategori, 150+ alt konu ve pedagojik kazanımlar</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="large" />
              <p className="mt-6 text-slate-500 animate-pulse">Konular yükleniyor...</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.isArray(topics) && topics.map((topic, index) => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  icon={TOPIC_ICONS[topic.icon] || Star}
                  gradient={TOPIC_COLORS[topic.color] || "from-violet-400 to-pink-500"}
                  onClick={() => handleTopicClick(topic.id)}
                  className={`animate-slide-up`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                  data-testid={`topic-card-${topic.id}`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Ad Banner Section */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="glass-card p-4 rounded-2xl">
            <AdBanner className="rounded-xl overflow-hidden" />
          </div>
        </div>
      </section>

      {/* Popular Stories Section - Bento Grid */}
      {popularStories.length > 0 && (
        <section className="py-12 md:py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                  En Çok Dinlenenler
                </h2>
                <p className="text-slate-500">Çocukların en sevdiği masallar</p>
              </div>
              <Link to="/stories" data-testid="view-all-stories-btn">
                <Button variant="outline" className="rounded-full border-slate-200 text-slate-700 hover:bg-white/80 hover:border-violet-300 hover:text-violet-600 backdrop-blur-sm">
                  Tümünü Gör
                </Button>
              </Link>
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
              {/* Featured Story - Large Card */}
              {popularStories[0] && (
                <div className="md:col-span-2 lg:col-span-2 lg:row-span-1">
                  <StoryCard 
                    story={popularStories[0]} 
                    variant="featured"
                    index={0}
                    className="h-full animate-slide-up"
                  />
                </div>
              )}
              
              {/* Regular Stories */}
              {popularStories.slice(1).map((story, index) => (
                <StoryCard 
                  key={story.id} 
                  story={story}
                  index={index + 1}
                  className="animate-slide-up"
                  style={{ animationDelay: `${(index + 1) * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section - Glassmorphism */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative rounded-3xl p-8 md:p-12 overflow-hidden">
            {/* Background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500" />
            
            {/* Glass overlay elements */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-32 bg-white/10 blur-2xl" />
            
            <div className="relative z-10 text-white">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Kazanım Temelli Masal Oluştur!
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-xl mx-auto">
                Hedef kazanıma göre kişiselleştirilmiş, pedagojik temelli masallar oluştur ve seslendir.
              </p>
              <Link to="/create" data-testid="create-story-cta-btn">
                <Button className="bg-white text-violet-600 hover:bg-white/90 font-bold py-6 px-10 rounded-full text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-300">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Masal Oluştur
                </Button>
              </Link>
              {/* Privacy & Terms Links */}
              <div className="mt-8 flex items-center justify-center gap-4 text-white/70 text-sm">
                <Link to="/privacy" className="hover:text-white underline underline-offset-2 transition-colors">
                  Gizlilik Politikası
                </Link>
                <span>•</span>
                <Link to="/terms" className="hover:text-white underline underline-offset-2 transition-colors">
                  Kullanım Koşulları
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
