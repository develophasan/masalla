import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { processGoogleCallback } = useAuth();
  const hasProcessed = useRef(false);

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Get session_id from URL fragment
        const hash = location.hash;
        const params = new URLSearchParams(hash.replace('#', ''));
        const sessionId = params.get('session_id');

        if (!sessionId) {
          toast.error('Giriş başarısız');
          navigate('/login');
          return;
        }

        await processGoogleCallback(sessionId);
        toast.success('Google ile giriş başarılı!');
        navigate('/', { replace: true });
      } catch (error) {
        console.error('Auth callback error:', error);
        toast.error('Giriş sırasında hata oluştu');
        navigate('/login');
      }
    };

    processAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50 to-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
        <p className="text-slate-600">Giriş yapılıyor...</p>
      </div>
    </div>
  );
}
