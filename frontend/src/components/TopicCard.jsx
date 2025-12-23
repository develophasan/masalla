import { cn } from "@/lib/utils";

const TOPIC_GRADIENTS = {
  organlar: "from-rose-400 to-pink-500",
  degerler: "from-violet-400 to-purple-500",
  doga: "from-emerald-400 to-green-500",
  duygular: "from-amber-400 to-orange-500",
  arkadaslik: "from-sky-400 to-blue-500",
  saglik: "from-teal-400 to-cyan-500",
};

export const TopicCard = ({ topic, icon: Icon, image, onClick, className, ...props }) => {
  const gradient = TOPIC_GRADIENTS[topic.id] || "from-violet-400 to-pink-500";

  return (
    <button
      onClick={onClick}
      className={cn("topic-card w-full text-left", className)}
      {...props}
    >
      {/* Image Section */}
      <div className="topic-card-image">
        {image ? (
          <img src={image} alt={topic.name} loading="lazy" />
        ) : (
          <div className={cn("w-full h-full bg-gradient-to-br", gradient)} />
        )}
        <div className="topic-card-overlay" />
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={cn("icon-circle flex-shrink-0 bg-gradient-to-br", gradient)}>
            {Icon && <Icon className="w-6 h-6" />}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <h4 className="text-xl font-bold text-slate-800 mb-1 group-hover:text-violet-600 transition-colors">
              {topic.name}
            </h4>
            <p className="text-sm text-slate-500 line-clamp-2">
              {topic.description}
            </p>
          </div>
        </div>
      </div>

      {/* Hover Indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
    </button>
  );
};

export default TopicCard;
