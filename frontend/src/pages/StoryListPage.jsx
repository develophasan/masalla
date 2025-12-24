import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Search, BookOpen, Filter, X, GraduationCap, Clock, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import StoryCard from "@/components/StoryCard";
import AdInterstitial from "@/components/AdInterstitial";
import AdBanner from "@/components/AdBanner";
import Navbar from "@/components/Navbar";
import LoadingSpinner from "@/components/LoadingSpinner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SORT_OPTIONS = [
  { id: "popular", name: "En Popüler" },
  { id: "newest", name: "En Yeni" },
  { id: "oldest", name: "En Eski" },
];

const CACHE_KEY = 'masal_stories_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function StoryListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize stories from cache for instant render
  const [stories, setStories] = useState(() => {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, timestamp, params } = JSON.parse(cached);
        // Only use cache for default view (no filters) and data must be array
        if (!searchParams.get("topic_id") && !searchParams.get("search") && 
            Date.now() - timestamp < CACHE_DURATION && Array.isArray(data)) {
          return data;
        }
      } catch (e) {
        localStorage.removeItem(CACHE_KEY);
      }
    }
    return [];
  });
  
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(stories.length === 0);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedTopic, setSelectedTopic] = useState(searchParams.get("topic_id") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "popular");
  const [showSearchAd, setShowSearchAd] = useState(false);
  const [pendingSearch, setPendingSearch] = useState(null);

  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    fetchStories();
  }, [searchParams]);

  const fetchTopics = async () => {
    try {
      // Use cached topics
      const cached = localStorage.getItem('masal_topics_cache');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION && Array.isArray(data)) {
          setTopics(data);
          return;
        }
      }
      const response = await axios.get(`${API}/topics`);
      if (Array.isArray(response.data)) {
        setTopics(response.data);
      }
    } catch (error) {
      console.error("Error fetching topics:", error);
    }
  };

  const fetchStories = async () => {
    const topicId = searchParams.get("topic_id");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "popular";
    
    // Check cache for default view
    const isDefaultView = !topicId && !search && sort === "popular";
    if (isDefaultView) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_DURATION && data.length > 0) {
            setStories(data);
            setLoading(false);
            return;
          }
        } catch (e) {}
      }
    }
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (topicId) params.append("topic_id", topicId);
      if (search) params.append("search", search);
      params.append("sort_by", sort);
      
      const response = await axios.get(`${API}/stories?${params.toString()}`);
      const storiesData = Array.isArray(response.data) ? response.data : [];
      setStories(storiesData);
      
      // Cache default view (without audio to save space)
      if (isDefaultView && storiesData.length > 0) {
        try {
          const cacheData = storiesData.map(s => ({...s, audio_base64: null}));
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: cacheData,
            timestamp: Date.now()
          }));
        } catch (e) {
          // localStorage quota exceeded - ignore
          console.warn('Cache quota exceeded, skipping cache');
        }
      }
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Show interstitial ad before search
      setPendingSearch(searchQuery);
      setShowSearchAd(true);
    }
  };

  const handleSearchAdClose = () => {
    setShowSearchAd(false);
    if (pendingSearch) {
      const params = new URLSearchParams(searchParams);
      params.set("search", pendingSearch);
      setSearchParams(params);
      setPendingSearch(null);
    }
  };

  const handleTopicChange = (value) => {
    setSelectedTopic(value);
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set("topic_id", value);
    } else {
      params.delete("topic_id");
    }
    setSearchParams(params);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    const params = new URLSearchParams(searchParams);
    if (value && value !== "popular") {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTopic("");
    setSortBy("popular");
    setSearchParams({});
  };

  const hasFilters = searchParams.get("topic_id") || searchParams.get("search") || searchParams.get("sort");

  const getTopicName = (topicId) => {
    const topic = topics.find((t) => t.id === topicId);
    return topic ? topic.name : topicId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50 to-white">
      {/* Search Interstitial Ad */}
      <AdInterstitial 
        isOpen={showSearchAd} 
        onClose={handleSearchAdClose}
        message="Masallar aranıyor..."
      />

      {/* Navbar */}
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            {selectedTopic ? getTopicName(selectedTopic) : "Tüm Masallar"}
          </h1>
          <p className="text-slate-500">
            {loading ? "Yükleniyor..." : `${stories.length} masal bulundu`}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 animate-slide-up stagger-1">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              type="text"
              placeholder="Masal veya kazanım ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-full border-2 border-slate-200 focus:border-violet-400"
              data-testid="search-input"
            />
          </form>

          {/* Topic Filter */}
          <Select value={selectedTopic} onValueChange={handleTopicChange}>
            <SelectTrigger className="w-full sm:w-48 rounded-full border-2 border-slate-200" data-testid="topic-filter">
              <Filter className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Konu Filtrele" />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              <SelectItem value="all">Tüm Konular</SelectItem>
              {Array.isArray(topics) && topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort Filter */}
          <Select value={sortBy} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full sm:w-40 rounded-full border-2 border-slate-200" data-testid="sort-filter">
              <ArrowUpDown className="w-4 h-4 mr-2 text-slate-400" />
              <SelectValue placeholder="Sırala" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-slate-500 hover:text-slate-700"
              data-testid="clear-filters-btn"
            >
              <X className="w-4 h-4 mr-1" />
              Temizle
            </Button>
          )}
        </div>

        {/* Stories Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <LoadingSpinner size="large" />
            <p className="mt-6 text-slate-500 animate-pulse">Masallar yükleniyor...</p>
          </div>
        ) : stories.length > 0 ? (
          <>
            {/* Ad Banner in results */}
            <div className="mb-8 flex justify-center">
              <div className="w-full max-w-3xl bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <AdBanner className="rounded-xl overflow-hidden" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.isArray(stories) && stories.map((story, index) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  className="animate-slide-up"
                  style={{ animationDelay: `${(index % 6) * 0.1}s` }}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state animate-slide-up">
            <div className="empty-state-icon">
              <BookOpen className="w-16 h-16" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">
              Masal Bulunamadı
            </h3>
            <p className="text-slate-500 mb-6">
              {hasFilters
                ? "Bu kriterlere uygun masal bulunamadı. Filtreleri değiştirmeyi deneyin."
                : "Henüz hiç masal eklenmemiş. İlk masalı sen oluştur!"}
            </p>
            {hasFilters ? (
              <Button onClick={clearFilters} variant="outline" className="rounded-full">
                Filtreleri Temizle
              </Button>
            ) : (
              <Link to="/create">
                <Button className="jelly-btn">Masal Oluştur</Button>
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
