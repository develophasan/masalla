import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, Clock, Heart, GraduationCap, User, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, authAxios } from "@/contexts/AuthContext";
import { API } from "@/config/api";
import { getCategoryTheme, getThemeColors, getThemeByIndex } from "@/lib/categoryThemes";

export const StoryCard = ({ 
  story, 
  className, 
  style, 
  showFavorite = true,
  variant = 'default', // 'default' | 'featured' | 'compact'
  index = 0,
}) => {
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Dinamik tema - kategoriye göre veya index'e göre
  const theme = getCategoryTheme(story.topic_id, story.topic_name) || getThemeByIndex(index);
  const colors = getThemeColors(theme);

  useEffect(() => {
    if (isAuthenticated && showFavorite) {
      checkFavorite();
    }
  }, [isAuthenticated, story.id]);

  const checkFavorite = async () => {
    try {
      const response = await authAxios.get(`${API}/favorites/check/${story.id}`);
      setIsFavorite(response.data.is_favorite);
    } catch (error) {
      // Ignore errors
    }
  };

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated || favoriteLoading) return;
    
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await authAxios.delete(`${API}/favorites/${story.id}`);
        setIsFavorite(false);
      } else {
        await authAxios.post(`${API}/favorites/${story.id}`);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Favorite toggle error:", error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleCreatorClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (story.creator_id) {
      window.location.href = `/user/${story.creator_id}`;
    }
  };

  // Use slug-based URL if available, fallback to id
  const storyUrl = story.slug ? `/masal/${story.slug}` : `/stories/${story.id}`;

  // Featured variant için özel render
  if (variant === 'featured') {
    return (
      <Link
        to={storyUrl}
        className={cn(
          "group relative block overflow-hidden rounded-3xl",
          "bg-gradient-to-br from-white/80 to-white/60",
          "backdrop-blur-xl border border-white/50",
          "shadow-lg hover:shadow-2xl",
          "transition-all duration-500 ease-out",
          "hover:scale-[1.02] hover:-translate-y-1",
          className
        )}
        style={{
          ...style,
          boxShadow: isHovered ? `0 20px 60px -15px ${colors.main}40` : undefined,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        data-testid={`story-card-featured-${story.id}`}
      >
        {/* Animated Background Gradient */}
        <div 
          className="absolute inset-0 opacity-20 transition-opacity duration-500 group-hover:opacity-30"
          style={{ background: colors.gradient }}
        />
        
        {/* Floating Orbs */}
        <div 
          className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-30 transition-all duration-700 group-hover:scale-150"
          style={{ background: colors.main }}
        />
        <div 
          className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full blur-3xl opacity-20 transition-all duration-700 group-hover:scale-150"
          style={{ background: colors.dark }}
        />

        {/* Content */}
        <div className="relative p-6 sm:p-8">
          {/* Top Section */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <span 
                className="px-3 py-1.5 rounded-full text-xs font-semibold text-white shadow-lg"
                style={{ background: colors.gradient }}
              >
                {story.topic_name}
              </span>
              {story.subtopic_name && (
                <span className="text-xs text-slate-500">
                  {story.subtopic_name}
                </span>
              )}
            </div>
            
            {/* Favorite Button */}
            {showFavorite && isAuthenticated && (
              <button
                onClick={toggleFavorite}
                className={cn(
                  "p-2.5 rounded-full transition-all duration-300",
                  "backdrop-blur-md shadow-md",
                  isFavorite 
                    ? "bg-red-100 text-red-500 scale-110" 
                    : "bg-white/80 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:scale-110"
                )}
                disabled={favoriteLoading}
              >
                <Heart 
                  className={cn("w-5 h-5 transition-transform", favoriteLoading && "animate-pulse")} 
                  fill={isFavorite ? "currentColor" : "none"}
                />
              </button>
            )}
          </div>

          {/* Title */}
          <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3 group-hover:text-slate-900 transition-colors line-clamp-2">
            {story.title}
          </h3>

          {/* Kazanım */}
          {story.kazanim && (
            <div 
              className="flex items-start gap-2 p-3 rounded-xl mb-4 transition-all duration-300"
              style={{ backgroundColor: `${colors.light}` }}
            >
              <GraduationCap className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: colors.dark }} />
              <span className="text-sm line-clamp-2" style={{ color: colors.dark }}>
                {story.kazanim}
              </span>
            </div>
          )}

          {/* Content Preview */}
          <p className="text-slate-600 line-clamp-3 mb-6">
            {story.content.substring(0, 150)}...
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {story.duration ? `${Math.ceil(story.duration / 60)} dk` : "~5 dk"}
              </span>
              <span className="flex items-center gap-1.5">
                <Play className="w-4 h-4" />
                {story.play_count} dinleme
              </span>
            </div>

            {/* Play Button */}
            <div 
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transform transition-all duration-500 group-hover:scale-110 group-hover:rotate-3"
              style={{ background: colors.gradient }}
            >
              <Play className="w-6 h-6 ml-1" fill="white" />
            </div>
          </div>

          {/* Creator */}
          {story.creator_name && (
            <div 
              className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100/50"
              onClick={handleCreatorClick}
            >
              {story.creator_picture ? (
                <img src={story.creator_picture} alt="" className="w-7 h-7 rounded-full ring-2 ring-white shadow" />
              ) : (
                <div 
                  className="w-7 h-7 rounded-full flex items-center justify-center ring-2 ring-white shadow"
                  style={{ background: colors.gradient }}
                >
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
              )}
              <span className="text-sm text-slate-600 hover:text-slate-800 transition-colors cursor-pointer">
                {story.creator_name}
              </span>
            </div>
          )}
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link
      to={storyUrl}
      className={cn(
        "group relative block overflow-hidden rounded-2xl",
        "bg-white/70 backdrop-blur-lg",
        "border border-white/60",
        "shadow-md hover:shadow-xl",
        "transition-all duration-400 ease-out",
        "hover:scale-[1.02] hover:-translate-y-1",
        className
      )}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`story-card-${story.id}`}
    >
      {/* Top Accent Bar */}
      <div 
        className="h-1.5 transition-all duration-300 group-hover:h-2"
        style={{ background: colors.gradient }}
      />

      {/* Hover Glow Effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
        style={{ background: colors.gradient }}
      />

      {/* Content */}
      <div className="relative p-5">
        {/* Favorite Button */}
        {showFavorite && isAuthenticated && (
          <button
            onClick={toggleFavorite}
            className={cn(
              "absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-300",
              "backdrop-blur-md shadow-sm",
              isFavorite 
                ? "bg-red-100 text-red-500" 
                : "bg-white/80 text-slate-400 hover:text-red-500 hover:bg-red-50"
            )}
            disabled={favoriteLoading}
          >
            <Heart 
              className={cn("w-4 h-4 transition-transform", favoriteLoading && "animate-pulse")} 
              fill={isFavorite ? "currentColor" : "none"}
            />
          </button>
        )}

        {/* Topic Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span 
            className="px-2.5 py-1 rounded-full text-xs font-medium text-white shadow-sm"
            style={{ background: colors.gradient }}
          >
            {story.topic_name}
          </span>
          {story.subtopic_name && (
            <span className="text-xs text-slate-400">
              {story.subtopic_name}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-800 group-hover:text-slate-900 transition-colors line-clamp-2 mb-2 pr-8">
          {story.title}
        </h3>

        {/* Kazanım */}
        {story.kazanim && (
          <div 
            className="flex items-start gap-1.5 p-2 rounded-lg mb-3 text-xs"
            style={{ backgroundColor: colors.light, color: colors.dark }}
          >
            <GraduationCap className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{story.kazanim}</span>
          </div>
        )}

        {/* Content Preview */}
        <p className="text-sm text-slate-500 line-clamp-2 mb-4">
          {story.content.substring(0, 100)}...
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100/80">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {story.duration ? `${Math.ceil(story.duration / 60)} dk` : "~5 dk"}
            </span>
            <span className="flex items-center gap-1">
              <Play className="w-3 h-3" />
              {story.play_count}
            </span>
          </div>

          {/* Play Button */}
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg"
            style={{ background: colors.gradient }}
          >
            <Play className="w-4 h-4 ml-0.5" fill="white" />
          </div>
        </div>

        {/* Creator Info */}
        {story.creator_name && (
          <div 
            className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-100/80"
            onClick={handleCreatorClick}
          >
            {story.creator_picture ? (
              <img src={story.creator_picture} alt="" className="w-5 h-5 rounded-full" />
            ) : (
              <div 
                className="w-5 h-5 rounded-full flex items-center justify-center"
                style={{ background: colors.gradient }}
              >
                <User className="w-2.5 h-2.5 text-white" />
              </div>
            )}
            <span className="text-xs text-slate-500 hover:text-slate-700 transition-colors cursor-pointer">
              {story.creator_name}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default StoryCard;
