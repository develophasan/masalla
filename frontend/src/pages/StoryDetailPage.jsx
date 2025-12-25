import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { 
  ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, 
  Clock, BookOpen, Heart, Sparkles, Share2, GraduationCap, Download, Lock, User, ChevronRight, Home
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AdInterstitial from "@/components/AdInterstitial";
import Navbar from "@/components/Navbar";
import { useAuth, authAxios } from "@/contexts/AuthContext";
import { API } from "@/config/api";

export default function StoryDetailPage() {
  const { id, slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const { isAuthenticated } = useAuth();
  
  // Determine if we're on new /masal/:slug or old /stories/:id route
  const isNewRoute = location.pathname.startsWith('/masal/');
  const storyIdentifier = slug || id;
  
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showText, setShowText] = useState(false);
  const [showDownloadAd, setShowDownloadAd] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [isPopularStory, setIsPopularStory] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  useEffect(() => {
    fetchStory();
    checkIfPopular();
  }, [storyIdentifier]);

  useEffect(() => {
    if (isAuthenticated && story?.id) {
      checkFavorite();
    }
  }, [isAuthenticated, story?.id]);

  // Redirect old URL to new SEO URL if story has slug
  useEffect(() => {
    if (story?.slug && !isNewRoute && story.slug !== storyIdentifier) {
      navigate(`/masal/${story.slug}`, { replace: true });
    }
  }, [story?.slug, isNewRoute, storyIdentifier, navigate]);

  const checkFavorite = async () => {
    try {
      const response = await authAxios.get(`${API}/favorites/check/${story.id}`);
      setIsFavorite(response.data.is_favorite);
    } catch (error) {
      // Ignore
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated || favoriteLoading) {
      if (!isAuthenticated) {
        toast.error("Favorilere eklemek için giriş yapmalısınız");
      }
      return;
    }
    
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await authAxios.delete(`${API}/favorites/${story.id}`);
        setIsFavorite(false);
        toast.success("Favorilerden çıkarıldı");
      } else {
        await authAxios.post(`${API}/favorites/${story.id}`);
        setIsFavorite(true);
        toast.success("Favorilere eklendi");
      }
    } catch (error) {
      toast.error("Bir hata oluştu");
    } finally {
      setFavoriteLoading(false);
    }
  };

  const checkIfPopular = async () => {
    try {
      const response = await axios.get(`${API}/stories/popular?limit=10`);
      const popularIds = Array.isArray(response.data) ? response.data.map(s => s.id) : [];
      setIsPopularStory(popularIds.includes(id));
    } catch (error) {
      console.log("Could not check popular stories");
    }
  };

  const fetchStory = async () => {
    try {
      const response = await axios.get(`${API}/stories/${id}`);
      setStory(response.data);
    } catch (error) {
      console.error("Error fetching story:", error);
      toast.error("Masal yüklenirken hata oluştu");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const incrementPlayCount = async () => {
    try {
      await axios.post(`${API}/stories/${id}/play`);
    } catch (error) {
      console.error("Error incrementing play count:", error);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    
    // Check if user can play this story
    if (!isAuthenticated && !isPopularStory) {
      toast.error("Bu masalı dinlemek için giriş yapmanız gerekiyor");
      return;
    }
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
      if (currentTime === 0) {
        incrementPlayCount();
      }
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: `"${story.title}" masalını masal.space'de dinle!`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Share cancelled");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link kopyalandı!");
    }
  };

  const handleDownloadClick = () => {
    // Show ad before download
    setShowDownloadAd(true);
  };

  const handleDownloadAdClose = () => {
    setShowDownloadAd(false);
    setCanDownload(true);
    // Trigger actual download
    downloadStory();
  };

  const downloadStory = () => {
    if (!story || !story.audio_base64) {
      toast.error("Ses dosyası bulunamadı");
      return;
    }
    
    try {
      // Convert base64 to blob
      const byteCharacters = atob(story.audio_base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'audio/mpeg' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${story.title.replace(/[^a-zA-Z0-9ğüşıöçĞÜŞİÖÇ ]/g, '')}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Masal indiriliyor!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("İndirme sırasında hata oluştu");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-slate-500">Masal yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Masal bulunamadı</p>
          <Link to="/">
            <Button>Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50 to-white pb-20 sm:pb-0">
      {/* Download Ad Interstitial */}
      <AdInterstitial 
        isOpen={showDownloadAd} 
        onClose={handleDownloadAdClose}
        message="İndirme hazırlanıyor..."
        autoCloseDelay={5000}
      />

      {/* Hidden Audio Element */}
      {story.audio_base64 && (
        <audio
          ref={audioRef}
          src={`data:audio/mp3;base64,${story.audio_base64}`}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleEnded}
        />
      )}

      {/* Navbar */}
      <Navbar />

      {/* Membership Required Banner for non-popular stories */}
      {!isAuthenticated && !isPopularStory && (
        <div className="bg-gradient-to-r from-violet-500 to-pink-500 text-white px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              <span className="font-medium">Bu masalı dinlemek için üye olun</span>
            </div>
            <div className="flex gap-2">
              <Link to="/login">
                <Button size="sm" variant="secondary">Giriş Yap</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-white text-violet-600 hover:bg-violet-50">Kayıt Ol</Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Story Header */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
            <span className="badge-topic">
              {story.topic_name}
            </span>
            {story.subtopic_name && (
              <span className="text-sm text-slate-500">• {story.subtopic_name}</span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
            {story.title}
          </h1>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {story.duration ? `${Math.ceil(story.duration / 60)} dk` : "~5 dk"}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {story.play_count} dinleme
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              {story.age_group}
            </span>
          </div>
          
          {/* Creator Info */}
          {story.creator_name && (
            <Link 
              to={`/user/${story.creator_id}`}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 hover:border-violet-200 hover:shadow-md transition-all"
            >
              {story.creator_picture ? (
                <img src={story.creator_picture} alt="" className="w-6 h-6 rounded-full" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
              )}
              <span className="text-sm text-slate-600 hover:text-violet-600 transition-colors">
                {story.creator_name} tarafından oluşturuldu
              </span>
            </Link>
          )}

          {/* Favorite Button */}
          <div className="mt-4">
            <Button
              onClick={toggleFavorite}
              disabled={favoriteLoading}
              variant={isFavorite ? "default" : "outline"}
              className={`rounded-full ${isFavorite ? "bg-red-500 hover:bg-red-600 text-white" : "border-red-200 text-red-500 hover:bg-red-50"}`}
            >
              <Heart 
                className={`w-5 h-5 mr-2 ${favoriteLoading ? "animate-pulse" : ""}`} 
                fill={isFavorite ? "currentColor" : "none"}
              />
              {isFavorite ? "Favorilerimde" : "Favorilere Ekle"}
            </Button>
          </div>
        </div>

        {/* Kazanım Card */}
        {story.kazanim && (
          <div className="mb-8 p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 animate-slide-up">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-amber-800 mb-1">Hedef Kazanım</p>
                <p className="text-amber-700">{story.kazanim}</p>
              </div>
            </div>
          </div>
        )}

        {/* Audio Player */}
        {story.audio_base64 && (
          <div className="audio-player mb-8 animate-slide-up stagger-1" data-testid="audio-player">
            {/* Main Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <button
                onClick={handleRestart}
                className="p-3 rounded-full bg-white shadow-md hover:shadow-lg text-violet-500 hover:scale-110 transition-transform"
                data-testid="restart-button"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              
              <button
                onClick={togglePlay}
                className="play-button"
                data-testid="play-pause-button"
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10" />
                ) : (
                  <Play className="w-10 h-10 ml-1" />
                )}
              </button>
              
              <button
                onClick={toggleMute}
                className="p-3 rounded-full bg-white shadow-md hover:shadow-lg text-violet-500 hover:scale-110 transition-transform"
                data-testid="mute-button"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div 
                className="progress-track cursor-pointer"
                onClick={handleSeek}
                data-testid="progress-bar"
              >
                <div 
                  className="progress-fill"
                  style={{ width: `${(currentTime / duration) * 100 || 0}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-slate-500 mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center justify-between">
              {/* Volume Slider */}
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="volume-slider"
                  data-testid="volume-slider"
                />
              </div>

              {/* Playback Speed */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Hız:</span>
                {[0.75, 1, 1.25].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handlePlaybackRateChange(rate)}
                    className={`speed-btn ${playbackRate === rate ? "active" : ""}`}
                    data-testid={`speed-btn-${rate}`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons: Share & Download */}
            <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-slate-100">
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex-1 rounded-full border-violet-200 text-violet-600 hover:bg-violet-50"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Paylaş
              </Button>
              <Button
                onClick={handleDownloadClick}
                className="flex-1 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white hover:from-violet-600 hover:to-pink-600"
              >
                <Download className="w-5 h-5 mr-2" />
                İndir
              </Button>
            </div>
          </div>
        )}

        {/* Story Text Toggle */}
        <div className="mb-6 animate-slide-up stagger-2">
          <Button
            variant="outline"
            onClick={() => setShowText(!showText)}
            className="w-full rounded-2xl border-violet-200 text-violet-600 hover:bg-violet-50"
            data-testid="toggle-text-button"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            {showText ? "Metni Gizle" : "Metni Göster"}
          </Button>
        </div>

        {/* Story Content */}
        {showText && (
          <div className="bg-white rounded-3xl p-6 md:p-10 shadow-lg border border-slate-100 animate-slide-up" data-testid="story-content">
            <div className="story-content whitespace-pre-wrap">
              {story.content}
            </div>
          </div>
        )}

        {/* Story Info */}
        <div className="mt-8 p-6 bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl border border-violet-100 animate-slide-up stagger-3">
          <h3 className="font-bold text-slate-800 mb-4">Masal Bilgileri</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-slate-500">Ana Konu:</span>
              <p className="font-medium text-slate-700">{story.topic_name}</p>
            </div>
            {story.subtopic_name && (
              <div>
                <span className="text-slate-500">Alt Konu:</span>
                <p className="font-medium text-slate-700">{story.subtopic_name}</p>
              </div>
            )}
            <div>
              <span className="text-slate-500">Tema:</span>
              <p className="font-medium text-slate-700">{story.theme}</p>
            </div>
            <div>
              <span className="text-slate-500">Yaş Grubu:</span>
              <p className="font-medium text-slate-700">{story.age_group}</p>
            </div>
            {story.character && (
              <div>
                <span className="text-slate-500">Ana Karakter:</span>
                <p className="font-medium text-slate-700">{story.character}</p>
              </div>
            )}
            {story.creator_name && (
              <div>
                <span className="text-slate-500">Oluşturan:</span>
                <Link 
                  to={`/user/${story.creator_id}`}
                  className="font-medium text-violet-600 hover:text-violet-700 flex items-center gap-1"
                >
                  {story.creator_picture ? (
                    <img src={story.creator_picture} alt="" className="w-5 h-5 rounded-full inline" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  {story.creator_name}
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
