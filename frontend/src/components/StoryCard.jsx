import { Link } from "react-router-dom";
import { Play, Clock, Heart, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

const TOPIC_COLORS = {
  vucudumuz: "from-rose-400 to-pink-500",
  doga: "from-emerald-400 to-green-500",
  hayvanlar: "from-amber-400 to-orange-500",
  degerler: "from-violet-400 to-purple-500",
  duygular: "from-pink-400 to-rose-500",
  okul: "from-sky-400 to-blue-500",
  guvenlik: "from-orange-400 to-red-500",
  saglik: "from-teal-400 to-cyan-500",
  akademik: "from-indigo-400 to-blue-500",
  kultur: "from-purple-400 to-violet-500",
  bilim: "from-cyan-400 to-teal-500",
  sanat: "from-fuchsia-400 to-pink-500",
  ahlak: "from-red-400 to-rose-500",
  oz_bakim: "from-lime-400 to-green-500",
  ozel: "from-slate-400 to-gray-500",
};

export const StoryCard = ({ story, className, style }) => {
  const topicColor = TOPIC_COLORS[story.topic_id] || "from-violet-400 to-pink-500";

  return (
    <Link
      to={`/stories/${story.id}`}
      className={cn("story-card group block", className)}
      style={style}
      data-testid={`story-card-${story.id}`}
    >
      {/* Top Section with Gradient */}
      <div className={cn("h-3 rounded-t-xl bg-gradient-to-r -mx-6 -mt-6 mb-4", topicColor)} />

      {/* Content */}
      <div className="space-y-3">
        {/* Topic Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="badge-topic text-xs">
            {story.topic_name}
          </span>
          {story.subtopic_name && (
            <span className="text-xs text-slate-400">
              • {story.subtopic_name}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-800 group-hover:text-violet-600 transition-colors line-clamp-2">
          {story.title}
        </h3>

        {/* Kazanım Preview */}
        {story.kazanim && (
          <div className="flex items-start gap-1.5 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
            <GraduationCap className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{story.kazanim}</span>
          </div>
        )}

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
