import { useState, useEffect, useRef } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Full screen interstitial ad
export const AdInterstitial = ({ 
  isOpen, 
  onClose, 
  autoCloseDelay = 5000,
  message = "Masalınız hazırlanıyor..."
}) => {
  const [countdown, setCountdown] = useState(5);
  const [canClose, setCanClose] = useState(false);
  const adRef = useRef(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
      setCanClose(false);
      isLoaded.current = false;
      
      // Load ad when modal opens
      const timer = setTimeout(() => {
        if (adRef.current && !isLoaded.current) {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            isLoaded.current = true;
          } catch (e) {
            console.log('AdSense error:', e);
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || canClose) return;

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanClose(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, canClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-500 to-pink-500 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5" />
            <span className="font-bold">{message}</span>
          </div>
          {canClose ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full"
            >
              <X className="w-5 h-5" />
            </Button>
          ) : (
            <span className="text-white/80 text-sm bg-white/20 px-3 py-1 rounded-full">
              {countdown}s
            </span>
          )}
        </div>

        {/* Ad Content */}
        <div className="p-6">
          <div className="bg-slate-50 rounded-2xl p-4 min-h-[280px] flex items-center justify-center">
            <ins
              ref={adRef}
              className="adsbygoogle"
              style={{ display: 'block', width: '100%', height: '250px' }}
              data-ad-client="ca-pub-1131412625965023"
              data-ad-slot="auto"
              data-ad-format="rectangle"
            />
          </div>
          
          {/* Sponsor text */}
          <p className="text-center text-xs text-slate-400 mt-4">
            Sponsorlu içerik - Masal Sepeti'ni destekleyin
          </p>
        </div>

        {/* Close Button */}
        {canClose && (
          <div className="px-6 pb-6">
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white font-bold py-3 rounded-full"
            >
              Devam Et
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdInterstitial;
