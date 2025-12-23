import { cn } from "@/lib/utils";

export default function LoadingSpinner({ size = "default", className }) {
  const sizeClasses = {
    small: "w-16 h-16",
    default: "w-24 h-24",
    large: "w-32 h-32"
  };

  return (
    <div className={cn("relative flex items-center justify-center", sizeClasses[size], className)}>
      {/* Logo in center */}
      <img 
        src="/logo.svg" 
        alt="Yükleniyor" 
        className="w-1/2 h-1/2 object-contain z-10"
      />
      
      {/* Spinning yarn orbit */}
      <div className="absolute inset-0 animate-spin-slow">
        {/* Yarn ball */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-400 via-rose-500 to-red-400 shadow-lg">
            {/* Yarn texture lines */}
            <div className="absolute inset-0.5 rounded-full border border-pink-300/50" />
            <div className="absolute inset-1 rounded-full border border-rose-200/30" />
          </div>
        </div>
        
        {/* Trail effect - multiple smaller balls */}
        <div className="absolute top-[15%] right-[10%]">
          <div className="w-2 h-2 rounded-full bg-pink-300 opacity-60" />
        </div>
        <div className="absolute top-[35%] right-0">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-300 opacity-40" />
        </div>
      </div>
      
      {/* Second orbit - opposite direction */}
      <div className="absolute inset-0 animate-spin-reverse">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-violet-400 via-purple-500 to-fuchsia-400 shadow-lg">
            <div className="absolute inset-0.5 rounded-full border border-violet-300/50" />
          </div>
        </div>
      </div>
      
      {/* Dotted orbit path */}
      <div className="absolute inset-0 rounded-full border-2 border-dashed border-slate-200 animate-pulse" />
    </div>
  );
}
