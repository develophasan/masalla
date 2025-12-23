import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Search, BookOpen, Filter, X } from "lucide-react";
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

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const TOPICS = [
  { id: "organlar", name: "Organlar" },
  { id: "degerler", name: "Değerler Eğitimi" },
  { id: "doga", name: "Doğa" },
  { id: "duygular", name: "Duygular" },
  { id: "arkadaslik", name: "Arkadaşlık" },
  { id: "saglik", name: "Sağlık" },
];

export default function StoryListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [selectedTopic, setSelectedTopic] = useState(searchParams.get("topic") || "");

  useEffect(() => {
    fetchStories();
  }, [searchParams]);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const topic = searchParams.get("topic");
      const search = searchParams.get("search");
      
      if (topic) params.append("topic", topic);
      if (search) params.append("search", search);
      
      const response = await axios.get(`${API}/stories?${params.toString()}`);
      setStories(response.data);
    } catch (error) {
      console.error("Error fetching stories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchQuery) {
      params.set("search", searchQuery);
    } else {
      params.delete("search");
    }
    setSearchParams(params);
  };

  const handleTopicChange = (value) => {
    setSelectedTopic(value);
    const params = new URLSearchParams(searchParams);
    if (value && value !== "all") {
      params.set("topic", value);
    } else {
      params.delete("topic");
    }
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTopic("");
    setSearchParams({});
  };

  const hasFilters = searchParams.get("topic") || searchParams.get("search");

  const getTopicName = (topicId) => {
    const topic = TOPICS.find((t) => t.id === topicId);
    return topic ? topic.name : topicId;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50 to-white">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="back-button" data-testid="back-button">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Ana Sayfa</span>
            </Link>
            
            <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
              <BookOpen className="w-6 h-6 text-violet-500" />
              <span className="text-xl font-bold text-violet-600">Masal Sepeti</span>
            </Link>
            
            <Link to="/create" data-testid="create-story-btn">
              <Button className="bg-violet-500 hover:bg-violet-600 rounded-full">
                Masal Ekle
              </Button>
            </Link>
          </div>
        </div>
      </header>

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
              placeholder="Masal ara..."
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
            <SelectContent>
              <SelectItem value="all">Tüm Konular</SelectItem>
              {TOPICS.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton h-48 rounded-2xl" />
            ))}
          </div>
        ) : stories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story, index) => (
              <StoryCard
                key={story.id}
                story={story}
                className={`animate-slide-up stagger-${(index % 6) + 1}`}
              />
            ))}
          </div>
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
