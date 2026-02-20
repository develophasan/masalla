import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { getCategoryTheme, getThemeColors, getThemeByIndex } from "@/lib/categoryThemes";

export const TopicCard = ({ 
  topic, 
  icon: Icon, 
  gradient, 
  onClick, 
  className, 
  style,
  index = 0,
  ...props 
}) => {
  // Dinamik tema - kategoriye göre veya index'e göre
  const theme = getCategoryTheme(topic.id, topic.name) || getThemeByIndex(index);
  const colors = getThemeColors(theme);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left relative overflow-hidden group",
        "bg-white/60 backdrop-blur-lg",
        "border border-white/60",
        "rounded-2xl",
        "shadow-sm hover:shadow-xl",
        "transition-all duration-400 ease-out",
        "hover:scale-[1.03] hover:-translate-y-1",
        className
      )}
      style={style}
      {...props}
    >
      {/* Hover Background Glow */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-15 transition-opacity duration-500"
        style={{ background: colors.gradient }}
      />
      
      {/* Content */}
      <div className="relative p-4 sm:p-5">
        {/* Icon */}
        <div 
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mb-3 shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
          style={{ background: colors.gradient }}
        >
          {Icon && <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />}
        </div>

        {/* Text */}
        <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1 group-hover:text-slate-900 transition-colors line-clamp-1">
          {topic.name}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 mb-3 min-h-[2rem]">
          {topic.description}
        </p>
        
        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Subtopic Count Badge */}
          {topic.subtopic_count && (
            <span 
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full transition-colors"
              style={{ 
                backgroundColor: colors.light,
                color: colors.dark 
              }}
            >
              {topic.subtopic_count} alt konu
            </span>
          )}
          
          {/* Arrow */}
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
            style={{ backgroundColor: colors.light }}
          >
            <ChevronRight className="w-4 h-4" style={{ color: colors.dark }} />
          </div>
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
        style={{ background: colors.gradient }}
      />
    </button>
  );
};

export default TopicCard;
