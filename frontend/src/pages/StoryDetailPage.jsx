import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, Play, Pause, RotateCcw, Volume2, VolumeX, 
  Clock, BookOpen, Heart, Sparkles, Share2, GraduationCap, Download, Lock, User, ChevronRight, Home, X, LogIn, UserPlus,
  Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import AdInterstitial from "@/components/AdInterstitial";
import AdBanner from "@/components/AdBanner";
import Navbar from "@/components/Navbar";
import { AmazonStoryBanner } from "@/components/AmazonAffiliate";
import { useAuth, authAxios } from "@/contexts/AuthContext";
import { API } from "@/config/api";
import { usePopularStories } from "@/hooks/useStories";
import { useScrollProgress, useInView, useMouseParallax, useScrollytelling } from "@/hooks/useScrollEffects";
import { getCategoryTheme, getThemeColors } from "@/lib/categoryThemes";

export default function StoryDetailPage() {
  const { id, slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const audioRef = useRef(null);
  const { isAuthenticated } = useAuth();
  
  // Determine if we're on new /masal/:slug or old /stories/:id route
  const isNewRoute = location.pathname.startsWith('/masal/');
  const storyIdentifier = slug || id;
  
  // React Query for story data
  const { data: story, isLoading: loading, isError } = useQuery({
    queryKey: ['story', storyIdentifier, isNewRoute],
    queryFn: async () => {
      const endpoint = isNewRoute 
        ? `${API}/masal/${storyIdentifier}`
        : `${API}/stories/${storyIdentifier}`;
      const response = await axios.get(endpoint);
      return response.data;
    },
    enabled: !!storyIdentifier,
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });

  // Use cached popular stories to check if current story is popular
  const { data: popularStories = [] } = usePopularStories(10);
  const isPopularStory = popularStories.some(s => s.id === story?.id || s.slug === storyIdentifier);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showText, setShowText] = useState(false);
  const [showDownloadAd, setShowDownloadAd] = useState(false);
  const [showShareAd, setShowShareAd] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'download' or 'share'
  const [canDownload, setCanDownload] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);

  // Handle error
  useEffect(() => {
    if (isError) {
      toast.error("Masal yüklenirken hata oluştu");
      navigate("/");
    }
  }, [isError, navigate]);

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

 

  const incrementPlayCount = async () => {
    if (!story?.id) return;
    try {
      await axios.post(`${API}/stories/${story.id}/play`);
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
    // Check if user is logged in
    if (!isAuthenticated) {
      setPendingAction('share');
      setShowAuthModal(true);
      return;
    }
    
    // Show ad before share
    setShowShareAd(true);
  };

  const executeShare = async () => {
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

  const handleShareAdClose = () => {
    setShowShareAd(false);
    executeShare();
  };

  const handleDownloadClick = () => {
    // Check if user is logged in
    if (!isAuthenticated) {
      setPendingAction('download');
      setShowAuthModal(true);
      return;
    }
    
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

  // Generate canonical URL
  const canonicalUrl = story.slug 
    ? `https://www.masal.space/masal/${story.slug}`
    : `https://www.masal.space/stories/${story.id}`;

  // Generate SEO description
  const seoDescription = `${story.age_group || ''} çocuklar için ${story.topic_name || ''} konulu eğitici masal. ${story.title}. ${story.kazanim ? `Kazanım: ${story.kazanim}` : ''}`.trim();

  // Schema.org JSON-LD for Article
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": story.title,
    "description": seoDescription,
    "datePublished": story.created_at,
    "dateModified": story.updated_at || story.created_at,
    "author": {
      "@type": "Person",
      "name": story.creator_name || "Masal Sepeti"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Masal Sepeti",
      "url": "https://masal.space",
      "logo": {
        "@type": "ImageObject",
        "url": "https://masal.space/icons/icon-512x512.png"
      }
    },
    "mainEntityOfPage": canonicalUrl,
    "articleSection": story.topic_name || "Çocuk Masalları",
    "keywords": `masal, ${story.topic_name || ''}, ${story.subtopic_name || ''}, çocuk masalları, eğitici masal, ${story.age_group || ''} yaş`.replace(/,\s*,/g, ','),
    "inLanguage": "tr-TR"
  };

  // AudioObject Schema for voice-enabled stories
  const audioSchema = story.audio_base64 ? {
    "@context": "https://schema.org",
    "@type": "AudioObject",
    "name": story.title,
    "description": `${story.title} sesli masal`,
    "duration": story.duration ? `PT${Math.floor(story.duration / 60)}M${story.duration % 60}S` : undefined,
    "encodingFormat": "audio/mpeg",
    "inLanguage": "tr-TR",
    "isAccessibleForFree": true
  } : null;

  // Breadcrumb Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Ana Sayfa",
        "item": "https://www.masal.space"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": story.topic_name || "Masallar",
        "item": `https://www.masal.space/stories?topic_id=${story.topic_id}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": story.title,
        "item": canonicalUrl
      }
    ]
  };

  // Scrollytelling - paragraphs
  const paragraphs = useScrollytelling(story?.content);
  
  // Scroll progress for reading indicator
  const scrollProgress = useScrollProgress();
  
  // Mouse parallax for decorations
  const mousePosition = useMouseParallax(0.02);
  
  // Get category theme colors
  const theme = getCategoryTheme(story?.topic_id, story?.topic_name);
  const colors = getThemeColors(theme);

  return (
    <div className="min-h-screen cloud-bg-animated pb-20 sm:pb-0 story-immersive-container">
      {/* Reading Progress Bar */}
      <div 
        className="reading-progress"
        style={{ width: `${scrollProgress * 100}%` }}
      />
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{story.title} | Masal Sepeti</title>
        <meta name="description" content={seoDescription} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={`${story.title} | Masal Sepeti`} />
        <meta property="og:description" content={seoDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="article" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={story.title} />
        <meta name="twitter:description" content={seoDescription} />
        
        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify(schemaData)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
        {audioSchema && (
          <script type="application/ld+json">
            {JSON.stringify(audioSchema)}
          </script>
        )}
      </Helmet>

      {/* Download Ad Interstitial */}
      <AdInterstitial 
        isOpen={showDownloadAd} 
        onClose={handleDownloadAdClose}
        message="İndirme hazırlanıyor..."
        autoCloseDelay={10000}
      />

      {/* Share Ad Interstitial */}
      <AdInterstitial 
        isOpen={showShareAd} 
        onClose={handleShareAdClose}
        message="Paylaşım hazırlanıyor..."
        autoCloseDelay={10000}
      />

      {/* Auth Required Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-slide-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-500 to-pink-500 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Lock className="w-5 h-5" />
                <span className="font-bold">Üyelik Gerekli</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAuthModal(false)}
                className="text-white hover:bg-white/20 rounded-full"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {pendingAction === 'download' ? (
                    <Download className="w-8 h-8 text-violet-600" />
                  ) : (
                    <Share2 className="w-8 h-8 text-violet-600" />
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {pendingAction === 'download' ? 'Masalı İndirmek İster misiniz?' : 'Masalı Paylaşmak İster misiniz?'}
                </h3>
                <p className="text-slate-600">
                  {pendingAction === 'download' 
                    ? 'Masalları indirmek için ücretsiz üye olun veya giriş yapın.' 
                    : 'Masalları paylaşmak için ücretsiz üye olun veya giriş yapın.'}
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-violet-500 to-pink-500 text-white font-bold rounded-full hover:shadow-lg transition-all"
                >
                  <UserPlus className="w-5 h-5" />
                  Ücretsiz Üye Ol
                </Link>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-slate-100 text-slate-700 font-medium rounded-full hover:bg-slate-200 transition-all"
                >
                  <LogIn className="w-5 h-5" />
                  Giriş Yap
                </Link>
              </div>

              <p className="text-center text-xs text-slate-400 mt-4">
                Üyelik tamamen ücretsizdir
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Parallax Background Decorations */}
      <div className="parallax-bg">
        <div 
          className="story-decoration w-96 h-96 top-20 -left-20"
          style={{ 
            background: colors.gradient,
            transform: `translate(${mousePosition.x * 2}px, ${mousePosition.y * 2}px)` 
          }}
        />
        <div 
          className="story-decoration w-72 h-72 top-1/3 -right-10"
          style={{ 
            background: `linear-gradient(135deg, ${colors.light} 0%, ${colors.main}50 100%)`,
            transform: `translate(${mousePosition.x * -1.5}px, ${mousePosition.y * -1.5}px)`,
            animationDelay: '-5s'
          }}
        />
        <div 
          className="story-decoration w-64 h-64 bottom-1/4 left-1/4"
          style={{ 
            background: `linear-gradient(135deg, rgba(251, 113, 133, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)`,
            transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
            animationDelay: '-10s'
          }}
        />
      </div>

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

      {/* Breadcrumb Navigation */}
      <div className="max-w-4xl mx-auto px-4 pt-4">
        <nav className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
          <Link to="/" className="flex items-center gap-1 hover:text-violet-600 transition-colors">
            <Home className="w-4 h-4" />
            <span>Ana Sayfa</span>
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link 
            to={`/stories?topic_id=${story.topic_id}`} 
            className="hover:text-violet-600 transition-colors"
          >
            {story.topic_name}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-700 font-medium truncate max-w-[200px]">
            {story.title}
          </span>
        </nav>
      </div>

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Story Header - Immersive Style */}
        <div className="text-center mb-12 animate-slide-up">
          {/* Topic Badge */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
            <span 
              className="px-4 py-2 rounded-full text-white font-medium shadow-lg"
              style={{ background: colors.gradient }}
            >
              {story.topic_name}
            </span>
            {story.subtopic_name && (
              <span className="text-sm text-slate-500 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full">
                {story.subtopic_name}
              </span>
            )}
          </div>
          
          {/* Title with gradient */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-clip-text text-transparent">
              {story.title}
            </span>
          </h1>
          
          {/* Meta info with glass style */}
          <div className="inline-flex items-center gap-4 px-6 py-3 glass-card rounded-full text-sm text-slate-600 flex-wrap justify-center">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" style={{ color: colors.main }} />
              {story.duration ? `${Math.ceil(story.duration / 60)} dk` : "~5 dk"}
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="flex items-center gap-1.5">
              <Heart className="w-4 h-4" style={{ color: colors.main }} />
              {story.play_count} dinleme
            </span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" style={{ color: colors.main }} />
              {story.age_group}
            </span>
          </div>
          
          {/* Creator Info */}
          {story.creator_name && (
            <Link 
              to={`/user/${story.creator_id}`}
              className="mt-6 inline-flex items-center gap-3 px-5 py-2.5 glass-card rounded-full hover:shadow-lg transition-all group"
            >
              {story.creator_picture ? (
                <img src={story.creator_picture} alt="" className="w-8 h-8 rounded-full ring-2 ring-white shadow" />
              ) : (
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center ring-2 ring-white shadow"
                  style={{ background: colors.gradient }}
                >
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              <span className="text-sm text-slate-600 group-hover:text-slate-800 transition-colors">
                {story.creator_name} tarafından oluşturuldu
              </span>
            </Link>
          )}

          {/* Action Buttons Row */}
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <Button
              onClick={toggleFavorite}
              disabled={favoriteLoading}
              className={cn(
                "rounded-full px-6 transition-all",
                isFavorite 
                  ? "bg-red-500 hover:bg-red-600 text-white shadow-lg" 
                  : "bg-white/80 backdrop-blur-sm text-red-500 border border-red-200 hover:bg-red-50"
              )}
            >
              <Heart 
                className={cn("w-5 h-5 mr-2", favoriteLoading && "animate-pulse")} 
                fill={isFavorite ? "currentColor" : "none"}
              />
              {isFavorite ? "Favorilerimde" : "Favorilere Ekle"}
            </Button>
          </div>
        </div>

        {/* Kazanım Card - Glass Style */}
        {story.kazanim && (
          <div 
            className="mb-10 p-6 glass-card-strong rounded-2xl animate-slide-up"
            style={{ borderLeft: `4px solid ${colors.main}` }}
          >
            <div className="flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg"
                style={{ background: colors.gradient }}
              >
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-800 mb-1 text-lg">Hedef Kazanım</p>
                <p className="text-slate-600">{story.kazanim}</p>
              </div>
            </div>
          </div>
        )}

        {/* Immersive Audio Player */}
        {story.audio_base64 && (
          <div className="immersive-player mb-10 animate-slide-up" data-testid="audio-player">
            {/* Audio Waveform Visualization */}
            <div className="flex items-center justify-center mb-8">
              <div className="audio-wave">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={cn("audio-wave-bar", !isPlaying && "paused")}
                    style={{ background: colors.gradient }}
                  />
                ))}
              </div>
            </div>
            
            {/* Main Controls */}
            <div className="flex items-center justify-center gap-6 mb-8">
              <button
                onClick={handleRestart}
                className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg text-slate-600 hover:scale-110 transition-all"
                data-testid="restart-button"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              
              <button
                onClick={togglePlay}
                className={cn(
                  "w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl hover:scale-105 transition-all",
                  isPlaying ? "" : "play-pulse"
                )}
                style={{ background: colors.gradient }}
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
                className="p-4 rounded-2xl bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg text-slate-600 hover:scale-110 transition-all"
                data-testid="mute-button"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div 
                className="h-2 bg-slate-100 rounded-full cursor-pointer overflow-hidden"
                onClick={handleSeek}
                data-testid="progress-bar"
              >
                <div 
                  className="h-full rounded-full transition-all duration-150"
                  style={{ 
                    width: `${(currentTime / duration) * 100 || 0}%`,
                    background: colors.gradient 
                  }}
                />
              </div>
              <div className="flex justify-between text-sm text-slate-500 mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Secondary Controls */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Volume Slider */}
              <div className="flex items-center gap-3">
                <Volume2 className="w-4 h-4 text-slate-400" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-24 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, ${colors.main} ${volume * 100}%, #e2e8f0 ${volume * 100}%)`
                  }}
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
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      playbackRate === rate 
                        ? "text-white shadow-md" 
                        : "bg-white/60 text-slate-600 hover:bg-white"
                    )}
                    style={playbackRate === rate ? { background: colors.gradient } : {}}
                    data-testid={`speed-btn-${rate}`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons: Share & Download */}
            <div className="flex items-center justify-center gap-4 mt-8 pt-6 border-t border-slate-100/50">
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex-1 rounded-xl border-slate-200 text-slate-700 hover:bg-white/80 py-6"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Paylaş
              </Button>
              <Button
                onClick={handleDownloadClick}
                className="flex-1 rounded-xl text-white py-6 shadow-lg hover:shadow-xl transition-all"
                style={{ background: colors.gradient }}
              >
                <Download className="w-5 h-5 mr-2" />
                İndir
              </Button>
            </div>
          </div>
        )}

        {/* Story Text Toggle */}
        <div className="mb-8 animate-slide-up">
          <Button
            variant="outline"
            onClick={() => setShowText(!showText)}
            className="w-full rounded-2xl py-6 glass-card border-white/60 text-slate-700 hover:bg-white/80 transition-all"
            data-testid="toggle-text-button"
          >
            {showText ? <EyeOff className="w-5 h-5 mr-2" /> : <Eye className="w-5 h-5 mr-2" />}
            {showText ? "Metni Gizle" : "Hikayeyi Oku"}
          </Button>
        </div>

        {/* Scrollytelling Story Content */}
        {showText && (
          <div className="glass-card-strong rounded-3xl p-8 md:p-12 mb-10 animate-slide-up" data-testid="story-content">
            <div className="max-w-2xl mx-auto">
              {paragraphs.map((paragraph, index) => (
                <StoryParagraph 
                  key={index} 
                  text={paragraph} 
                  index={index}
                  colors={colors}
                />
              ))}
            </div>
          </div>
        )}

        {/* Ad Banner after story content */}
        <div className="my-8 glass-card p-4 rounded-2xl">
          <AdBanner className="rounded-xl overflow-hidden" />
        </div>

        {/* Amazon Affiliate Banner */}
        <AmazonStoryBanner topic={story.topic_name} />

        {/* Story Info - Glass Style */}
        <div className="mt-8 p-6 glass-card-strong rounded-2xl animate-slide-up">
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
                  className="font-medium hover:underline flex items-center gap-1"
                  style={{ color: colors.main }}
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

// Scrollytelling Paragraph Component
const StoryParagraph = ({ text, index, colors }) => {
  const [ref, isInView] = useInView();
  
  // First paragraph gets special styling
  const isFirst = index === 0;
  
  return (
    <p
      ref={ref}
      className={cn(
        "story-paragraph mb-6 last:mb-0",
        isInView && "in-view",
        isFirst ? "story-text-immersive" : "text-lg leading-relaxed text-slate-700"
      )}
      style={{
        transitionDelay: `${index * 150}ms`
      }}
    >
      {text}
    </p>
  );
};
