import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, BookOpen, ChevronRight, Sparkles, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { API } from "@/config/api";

export default function TopicDetailPage() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopicDetail();
  }, [topicId]);

  const fetchTopicDetail = async () => {
    try {
      const response = await axios.get(`${API}/topics/${topicId}`);
      setTopic(response.data);
    } catch (error) {
      console.error("Error fetching topic:", error);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const handleSubtopicClick = (subtopic) => {
    navigate(`/create?topic=${topicId}&subtopic=${subtopic.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-slate-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Konu bulunamadı</p>
          <Link to="/">
            <Button>Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50 to-white">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate("/")} 
              className="back-button"
              data-testid="back-button"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Ana Sayfa</span>
            </button>
            
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Topic Header */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-100 mb-8 animate-slide-up">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            {topic.image && (
              <img 
                src={topic.image} 
                alt={topic.name}
                className="w-full md:w-48 h-32 object-cover rounded-2xl"
              />
            )}
            <div className="flex-1">
              <Badge className="mb-3 bg-violet-100 text-violet-700 hover:bg-violet-100">
                {topic.subtopics?.length || 0} Alt Konu
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                {topic.name}
              </h1>
              <p className="text-slate-500 text-lg">{topic.description}</p>
            </div>
          </div>
        </div>

        {/* Subtopics Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-violet-500" />
            Alt Konular ve Kazanımlar
          </h2>

          <div className="grid gap-4">
            {topic.subtopics?.map((subtopic, index) => (
              <button
                key={subtopic.id}
                onClick={() => handleSubtopicClick(subtopic)}
                className="w-full text-left bg-white rounded-2xl p-5 border-2 border-slate-100 hover:border-violet-300 hover:shadow-lg transition-all group animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
                data-testid={`subtopic-${subtopic.id}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-violet-600 transition-colors mb-2">
                      {subtopic.name}
                    </h3>
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-slate-500">
                        <span className="font-medium text-slate-600">Kazanım:</span> {subtopic.kazanim}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-violet-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">Masal Oluştur</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Stories from this topic */}
        <div className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl p-6 border border-violet-100">
          <h3 className="font-bold text-slate-800 mb-4">Bu Konudaki Masalları Keşfet</h3>
          <Link to={`/stories?topic_id=${topicId}`}>
            <Button className="bg-violet-500 hover:bg-violet-600 rounded-full">
              Masalları Gör
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
