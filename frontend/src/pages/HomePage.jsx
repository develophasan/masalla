import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
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
import { API } from "@/config/api";

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
  const [topics, setTopics] = useState(() => {
    // Load from cache immediately for faster render
    const cached = localStorage.getItem('masal_topics_cache');
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        // Cache valid for 1 hour and data must be array
        if (Date.now() - timestamp < 3600000 && Array.isArray(data)) {
          return data;
        }
      } catch (e) {
        // Invalid cache, clear it
        localStorage.removeItem('masal_topics_cache');
      }
    }
    return [];
  });
  
  const [popularStories, setPopularStories] = useState(() => {
    // Load popular stories from cache
    const cached = localStorage.getItem('masal_popular_cache');
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        // Cache valid for 5 minutes and data must be array
        if (Date.now() - timestamp < 300000 && Array.isArray(data)) {
          return data;
        }
      } catch (e) {
        // Invalid cache, clear it
        localStorage.removeItem('masal_popular_cache');
      }
    }
    return [];
  });
  
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(topics.length === 0 && popularStories.length === 0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Check if we need to fetch
      const topicsCached = localStorage.getItem('masal_topics_cache');
      const storiesCached = localStorage.getItem('masal_popular_cache');
      
      let needTopics = true;
      let needStories = true;
      
      if (topicsCached) {
        const { timestamp } = JSON.parse(topicsCached);
        if (Date.now() - timestamp < 3600000) needTopics = false;
      }
      
      if (storiesCached) {
        const { timestamp } = JSON.parse(storiesCached);
        if (Date.now() - timestamp < 300000) needStories = false;
      }
      
      // Only fetch what's needed
      const requests = [];
      if (needTopics) requests.push(axios.get(`${API}/topics`));
      if (needStories) requests.push(axios.get(`${API}/stories/popular?limit=6`));
      
      if (requests.length === 0) {
        setLoading(false);
        return;
      }
      
      const responses = await Promise.all(requests);
      let idx = 0;
      
      if (needTopics) {
        const topicsData = responses[idx].data;
        // Validate that data is an array
        if (Array.isArray(topicsData)) {
          setTopics(topicsData);
          try {
            localStorage.setItem('masal_topics_cache', JSON.stringify({
              data: topicsData,
              timestamp: Date.now()
            }));
          } catch (e) {
            console.warn('Cache quota exceeded, skipping cache');
          }
        } else {
          console.error('Topics API did not return an array:', topicsData);
          setTopics([]);
        }
        idx++;
      }
      
      if (needStories) {
        const storiesData = responses[idx].data;
        // Validate that data is an array
        if (Array.isArray(storiesData)) {
          setPopularStories(storiesData);
          // Cache without audio_base64 to save space
          try {
            const cacheData = storiesData.map(s => ({...s, audio_base64: null}));
            localStorage.setItem('masal_popular_cache', JSON.stringify({
              data: cacheData,
              timestamp: Date.now()
            }));
          } catch (e) {
            // localStorage quota exceeded - ignore
            console.warn('Cache quota exceeded, skipping cache');
          }
        } else {
          console.error('Stories API did not return an array:', storiesData);
          setPopularStories([]);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/stories?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleTopicClick = (topicId) => {
    navigate(`/topics/${topicId}`);
  };

  return (
    <div className="min-h-screen pb-20 sm:pb-0">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="hero-section relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-violet-200 mb-4 animate-slide-up">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium text-violet-600">15 Ana Kategori • 150+ Alt Konu • Kazanım Destekli</span>
            </div>
            
            {/* Hero Logo */}
            <div className="flex justify-center mb-2 animate-slide-up">
              <img 
                src="/logo.svg" 
                alt="Masal Sepeti" 
                className="h-24 md:h-32 w-auto"
              />
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-3 animate-slide-up stagger-1">
              <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">Masal</span>{" "}
              <span className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 bg-clip-text text-transparent">Sepeti</span>
            </h2>
            
            <p className="text-base md:text-lg text-slate-600 mb-6 animate-slide-up stagger-2">
              Konu seç, kazanım belirle, masalı dinle! Çocuklarınız için pedagojik temelli eğitici masallar.
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto animate-slide-up stagger-3">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Masal veya kazanım ara... (örn: empati, paylaşma)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input pl-12 pr-4 py-6 text-lg"
                data-testid="search-input"
              />
              <Button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-violet-500 hover:bg-violet-600 rounded-full px-6"
                data-testid="search-button"
              >
                Ara
              </Button>
            </form>

            {/* Quick Create Button (Mobile) */}
            <Link to="/create" className="sm:hidden mt-6 inline-block" data-testid="create-story-mobile-btn">
              <Button className="jelly-btn flex items-center gap-2">
                <Plus className="w-5 h-5" />
                <span>Yeni Masal Oluştur</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-16 h-16 bg-violet-200 rounded-full opacity-30 animate-float" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-pink-200 rounded-full opacity-30 animate-float stagger-2" />
        <div className="absolute top-40 right-10 w-8 h-8 bg-amber-200 rounded-full opacity-40 animate-float stagger-3" />
      </section>

      {/* How to Create Story Guide */}
      <section className="py-12 md:py-16 px-4 bg-gradient-to-b from-white to-violet-50/50">
        <div className="max-w-5xl mx-auto">
          <HowToCreateStory />
        </div>
      </section>

      {/* Topics Section */}
      <section className="py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h3 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
              Konu Havuzu
            </h3>
            <p className="text-slate-500 text-lg">15 ana kategori, 150+ alt konu ve pedagojik kazanımlar</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="large" />
              <p className="mt-6 text-slate-500 animate-pulse">Konular yükleniyor...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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

      {/* Popular Stories Section */}
      {popularStories.length > 0 && (
        <section className="py-12 md:py-20 px-4 bg-gradient-to-b from-white to-violet-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                  En Çok Dinlenenler
                </h3>
                <p className="text-slate-500">Çocukların en sevdiği masallar</p>
              </div>
              <Link to="/stories" data-testid="view-all-stories-btn">
                <Button variant="outline" className="rounded-full border-violet-200 text-violet-600 hover:bg-violet-50">
                  Tümünü Gör
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(popularStories) && popularStories.map((story, index) => (
                <StoryCard 
                  key={story.id} 
                  story={story}
                  className={`animate-slide-up`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-violet-500 to-pink-500 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Kazanım Temelli Masal Oluştur!
              </h3>
              <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
                Hedef kazanıma göre kişiselleştirilmiş, pedagojik temelli masallar oluştur ve seslendir.
              </p>
              <Link to="/create" data-testid="create-story-cta-btn">
                <Button className="bg-white text-violet-600 hover:bg-white/90 font-bold py-6 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-shadow">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Masal Oluştur
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-6 h-6 text-violet-500" />
            <span className="text-xl font-bold text-violet-600">Masal Sepeti</span>
          </div>
          <p className="text-slate-500 text-sm">
            Çocuklar için yapay zeka destekli, kazanım temelli eğitici masal platformu
          </p>
          <p className="text-slate-400 text-xs mt-4">
            © 2025 masal.space - Masal Sepeti. Tüm hakları saklıdır.
          </p>
          <p className="text-slate-400 text-xs mt-2">
            Designed by{" "}
            <a 
              href="https://github.com/develophasan" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-violet-500 hover:text-violet-600 font-medium transition-colors"
            >
              Hasan Özdemir
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
