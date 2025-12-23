import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, UserPlus, Sparkles, Play, ChevronLeft, ChevronRight,
  MousePointer, ListChecks, Headphones
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const STEPS = [
  {
    id: 1,
    title: "Üye Olun",
    description: "Hızlıca kayıt olun veya Google ile giriş yapın. İlk üyelikte 10 kredi hediye!",
    icon: UserPlus,
    color: "from-violet-400 to-violet-600",
    image: "📝"
  },
  {
    id: 2,
    title: "Konu Seçin",
    description: "15 ana kategoriden birini seçin: Değerler, Duygular, Doğa ve daha fazlası.",
    icon: ListChecks,
    color: "from-pink-400 to-pink-600",
    image: "📚"
  },
  {
    id: 3,
    title: "Detayları Belirleyin",
    description: "Alt konu, tema, yaş grubu ve karakter seçerek masalınızı özelleştirin.",
    icon: MousePointer,
    color: "from-amber-400 to-orange-500",
    image: "✨"
  },
  {
    id: 4,
    title: "Masalı Oluşturun",
    description: "Yapay zeka masalınızı yazacak ve Türkçe seslendirme ekleyecek.",
    icon: Sparkles,
    color: "from-emerald-400 to-teal-500",
    image: "🪄"
  },
  {
    id: 5,
    title: "Dinleyin & Paylaşın",
    description: "Masalınızı dinleyin, indirin ve sevdiklerinizle paylaşın!",
    icon: Headphones,
    color: "from-blue-400 to-indigo-500",
    image: "🎧"
  }
];

export default function HowToCreateStory() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % STEPS.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToStep = (index) => {
    setCurrentStep(index);
    setIsAutoPlaying(false);
  };

  const goNext = () => {
    setCurrentStep((prev) => (prev + 1) % STEPS.length);
    setIsAutoPlaying(false);
  };

  const goPrev = () => {
    setCurrentStep((prev) => (prev - 1 + STEPS.length) % STEPS.length);
    setIsAutoPlaying(false);
  };

  const step = STEPS[currentStep];
  const StepIcon = step.icon;

  return (
    <div className="bg-gradient-to-r from-violet-50 via-pink-50 to-amber-50 rounded-3xl p-6 md:p-8 border border-violet-100 shadow-lg">
      <div className="text-center mb-6">
        <h3 className="text-2xl md:text-3xl font-bold text-slate-800 mb-2">
          Nasıl Masal Oluşturulur?
        </h3>
        <p className="text-slate-500">5 kolay adımda kendi masalınızı oluşturun</p>
      </div>

      {/* Main Slide Area */}
      <div className="relative">
        <div className="flex items-center gap-6 md:gap-10">
          {/* Left Arrow */}
          <button
            onClick={goPrev}
            className="hidden md:flex w-10 h-10 rounded-full bg-white shadow-md items-center justify-center text-slate-400 hover:text-violet-600 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Step Content */}
          <div className="flex-1 flex flex-col md:flex-row items-center gap-6">
            {/* Icon/Image */}
            <div className={`w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-xl transform transition-transform hover:scale-105`}>
              <span className="text-6xl md:text-7xl">{step.image}</span>
            </div>

            {/* Text */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded-full text-sm text-violet-600 font-medium mb-3 shadow-sm">
                <span className="w-6 h-6 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold">
                  {step.id}
                </span>
                Adım {step.id}
              </div>
              <h4 className="text-xl md:text-2xl font-bold text-slate-800 mb-2">{step.title}</h4>
              <p className="text-slate-600 text-base md:text-lg">{step.description}</p>
            </div>
          </div>

          {/* Right Arrow */}
          <button
            onClick={goNext}
            className="hidden md:flex w-10 h-10 rounded-full bg-white shadow-md items-center justify-center text-slate-400 hover:text-violet-600 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Arrows */}
        <div className="flex md:hidden justify-center gap-4 mt-4">
          <button
            onClick={goPrev}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-400"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-400"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {STEPS.map((_, index) => (
          <button
            key={index}
            onClick={() => goToStep(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentStep 
                ? 'w-8 bg-violet-500' 
                : 'w-2 bg-slate-300 hover:bg-slate-400'
            }`}
          />
        ))}
      </div>

      {/* CTA Button */}
      <div className="text-center mt-6">
        <Link to="/create">
          <Button className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white px-8 py-6 rounded-full font-medium shadow-lg hover:shadow-xl transition-all">
            <Sparkles className="w-5 h-5 mr-2" />
            Hemen Masal Oluştur
          </Button>
        </Link>
      </div>
    </div>
  );
}
