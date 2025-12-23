import { Link } from "react-router-dom";
import { Play, Clock, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

const TOPIC_NAMES = {
  organlar: "Organlar",
  degerler: "Değerler Eğitimi",
  doga: "Doğa",
  duygular: "Duygular",
  arkadaslik: "Arkadaşlık",
  saglik: "Sağlık",
};

const TOPIC_COLORS = {
  organlar: "from-rose-400 to-pink-500",
  degerler: "from-violet-400 to-purple-500",
  doga: "from-emerald-400 to-green-500",
  duygular: "from-amber-400 to-orange-500",
  arkadaslik: "from-sky-400 to-blue-500",
  saglik: "from-teal-400 to-cyan-500",
};

export const StoryCard = ({ story, className }) => {
  const topicColor = TOPIC_COLORS[story.topic] || "from-violet-400 to-pink-500";

  return (
    <Link
      to={`/stories/${story.id}`}
      className={cn("story-card group block", className)}
      data-testid={`story-card-${story.id}`}
    >
      {/* Top Section with Gradient */}
      <div className={cn("h-3 rounded-t-xl bg-gradient-to-r -mx-6 -mt-6 mb-4", topicColor)} />

      {/* Content */}
      <div className="space-y-3">
        {/* Topic Badge */}
        <span className="badge-topic text-xs">
          {TOPIC_NAMES[story.topic] || story.topic}
        </span>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-800 group-hover:text-violet-600 transition-colors line-clamp-2">
          {story.title}
        </h3>

        {/* Content Preview */}
        <p className="text-sm text-slate-500 line-clamp-2">
          {story.content.substring(0, 100)}...
        </p>

        {/* Meta Info */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {story.duration ? `${Math.ceil(story.duration / 60)} dk` : "~5 dk"}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" />
              {story.play_count}
            </span>
          </div>

          {/* Play Button */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all">
            <Play className="w-4 h-4 ml-0.5" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default StoryCard;
