import { cn } from "@/lib/utils";

export const TopicCard = ({ topic, icon: Icon, gradient, onClick, className, style, ...props }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "topic-card w-full text-left relative overflow-hidden group",
        className
      )}
      style={style}
      {...props}
    >
      {/* Background Gradient */}
      <div className={cn("absolute inset-0 opacity-10 bg-gradient-to-br", gradient)} />
      
      {/* Content */}
      <div className="relative p-5">
        {/* Icon */}
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br shadow-lg",
          gradient
        )}>
          {Icon && <Icon className="w-6 h-6 text-white" />}
        </div>

        {/* Text */}
        <h4 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-violet-600 transition-colors line-clamp-1">
          {topic.name}
        </h4>
        <p className="text-xs text-slate-500 line-clamp-2 mb-2">
          {topic.description}
        </p>
        
        {/* Subtopic Count Badge */}
        {topic.subtopic_count && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 bg-violet-50 px-2 py-1 rounded-full">
            {topic.subtopic_count} alt konu
          </span>
        )}
      </div>

      {/* Hover Indicator */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left",
        gradient
      )} />
    </button>
  );
};

export default TopicCard;
