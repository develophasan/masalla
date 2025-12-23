import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, 
  Clock, BookOpen, Heart, Sparkles, Share2, GraduationCap, Download, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AdInterstitial from "@/components/AdInterstitial";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function StoryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const { isAuthenticated } = useAuth();
  
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

  useEffect(() => {
    fetchStory();
    checkIfPopular();
  }, [id]);

  const checkIfPopular = async () => {
    try {
      const response = await axios.get(`${API}/stories/popular?limit=10`);
      const popularIds = response.data.map(s => s.id);
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
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50 to-white">
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

      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)} 
              className="back-button"
              data-testid="back-button"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Geri</span>
            </button>
            
            <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
              <BookOpen className="w-6 h-6 text-violet-500" />
              <span className="text-xl font-bold text-violet-600 hidden sm:inline">Masal Sepeti</span>
            </Link>
            
            <div className="flex items-center gap-2">
              {story.audio_base64 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleDownloadClick}
                  className="text-violet-500 hover:bg-violet-50"
                  title="Masalı İndir"
                >
                  <Download className="w-5 h-5" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleShare}
                className="text-slate-500 hover:text-violet-600"
                data-testid="share-button"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

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
          <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
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
          </div>
        </div>
      </main>
    </div>
  );
}
