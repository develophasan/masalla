import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Sparkles, Users, BookOpen, Wand2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SLIDES = [
  {
    id: 1,
    title: "Sınıfınıza Özel Masallar",
    description: "Öğrencilerinizin isimlerini kullanarak onlara özel, eğitici masallar oluşturun. Her masal pedagojik kazanımlarla desteklenir.",
    icon: Users,
    color: "from-violet-500 to-purple-600",
    bgColor: "bg-violet-50",
    image: "👨‍🏫👧👦"
  },
  {
    id: 2,
    title: "Konu ve Kazanım Seçin",
    description: "15 ana kategori ve 150+ alt konudan seçim yapın. Paylaşım, empati, doğa sevgisi gibi değerleri masallarla öğretin.",
    icon: BookOpen,
    color: "from-pink-500 to-rose-600",
    bgColor: "bg-pink-50",
    image: "📚✨🎯"
  },
  {
    id: 3,
    title: "Öğrenci İsimlerini Girin",
    description: "Karakter adı kısmına sınıfınızdaki öğrencilerin isimlerini yazın. Masal onların isimleriyle oluşturulacak!",
    icon: Wand2,
    color: "from-amber-500 to-orange-600",
    bgColor: "bg-amber-50",
    image: "✏️ Ayşe, Mehmet, Zeynep"
  },
  {
    id: 4,
    title: "Dinleyin ve Paylaşın",
    description: "Yapay zeka masalınızı yazar, profesyonel ses ile seslendirir. Sınıfta birlikte dinleyin veya velilere gönderin!",
    icon: Play,
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-50",
    image: "🎧📱💜"
  }
];

export default function WelcomeModal() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    // Check if user has seen the welcome modal before
    const hasSeenWelcome = localStorage.getItem('masal_welcome_seen');
    if (!hasSeenWelcome) {
      // Small delay for better UX
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('masal_welcome_seen', 'true');
  };

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleCreateStory = () => {
    handleClose();
    navigate('/create');
  };

  if (!isOpen) return null;

  const slide = SLIDES[currentSlide];
  const SlideIcon = slide.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-md flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Gradient */}
        <div className={`h-2 bg-gradient-to-r ${slide.color}`} />

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Top Badge */}
          <div className="flex justify-center mb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-100 to-pink-100 rounded-full">
              <Sparkles className="w-4 h-4 text-violet-600" />
              <span className="text-sm font-semibold text-violet-700">Öğretmenlere Özel</span>
            </div>
          </div>

          {/* Main Title (only on first slide) */}
          {currentSlide === 0 && (
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-slate-800 mb-6">
              Sınıfınızın İlk Masalını<br />
              <span className="bg-gradient-to-r from-violet-600 to-pink-600 bg-clip-text text-transparent">
                Oluşturun!
              </span>
            </h2>
          )}

          {/* Slide Content */}
          <div className="relative">
            {/* Icon & Visual */}
            <div className={`w-24 h-24 mx-auto mb-6 rounded-2xl ${slide.bgColor} flex items-center justify-center`}>
              {currentSlide === 2 ? (
                <div className="text-center">
                  <span className="text-3xl">✏️</span>
                </div>
              ) : (
                <SlideIcon className={`w-12 h-12 bg-gradient-to-br ${slide.color} bg-clip-text text-transparent`} style={{color: 'transparent', background: `linear-gradient(135deg, var(--tw-gradient-from), var(--tw-gradient-to))`}} />
              )}
            </div>

            {/* Emoji Visual */}
            <div className="text-4xl sm:text-5xl text-center mb-4 animate-bounce-slow">
              {slide.image}
            </div>

            {/* Slide Title */}
            <h3 className={`text-xl font-bold text-center mb-3 bg-gradient-to-r ${slide.color} bg-clip-text text-transparent`}>
              {slide.title}
            </h3>

            {/* Description */}
            <p className="text-slate-600 text-center leading-relaxed mb-6">
              {slide.description}
            </p>

            {/* Example Box for Slide 3 */}
            {currentSlide === 2 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-sm text-amber-800 font-medium mb-2">💡 Örnek Karakter Girişi:</p>
                <div className="bg-white rounded-lg px-4 py-3 border border-amber-200">
                  <span className="text-slate-600">Ayşe, Mehmet, Zeynep ve Ali</span>
                </div>
                <p className="text-xs text-amber-600 mt-2">Masalda bu isimler kullanılacak!</p>
              </div>
            )}
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mb-6">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'w-8 bg-gradient-to-r from-violet-500 to-pink-500' 
                    : 'bg-slate-200 hover:bg-slate-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className={`flex-1 ${currentSlide === 0 ? 'opacity-0 pointer-events-none' : ''}`}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Geri
            </Button>

            {currentSlide < SLIDES.length - 1 ? (
              <Button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white"
              >
                İleri
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleCreateStory}
                className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white animate-pulse-slow"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Hadi Başlayalım!
              </Button>
            )}
          </div>

          {/* Skip Link */}
          <button
            onClick={handleClose}
            className="w-full mt-4 text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            Daha sonra göster
          </button>
        </div>
      </div>
    </div>
  );
}
