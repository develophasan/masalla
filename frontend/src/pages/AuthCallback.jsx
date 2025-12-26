import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { processGoogleCallback } = useAuth();
  const hasProcessed = useRef(false);
  const [status, setStatus] = useState('processing'); // processing, success, error

  useEffect(() => {
    // Prevent double processing in StrictMode
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processAuth = async () => {
      try {
        // Get authorization code from URL query params
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        if (error) {
          console.error('Google OAuth error:', error);
          toast.error('Google girişi iptal edildi');
          navigate('/login');
          return;
        }

        if (!code) {
          toast.error('Giriş başarısız - kod bulunamadı');
          navigate('/login');
          return;
        }

        await processGoogleCallback(code);
        setStatus('success');
        toast.success('Google ile giriş başarılı!');
        
        // Small delay to ensure state is propagated, then force reload to home
        setTimeout(() => {
          window.location.href = '/';
        }, 500);
        
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        toast.error('Giriş sırasında hata oluştu');
        setTimeout(() => {
          navigate('/login');
        }, 1000);
      }
    };

    processAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50 to-white flex items-center justify-center">
      <div className="text-center">
        {status === 'processing' && (
          <>
            <Loader2 className="w-12 h-12 text-violet-500 animate-spin mx-auto mb-4" />
            <p className="text-slate-600">Giriş yapılıyor...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-slate-600">Giriş başarılı! Yönlendiriliyorsunuz...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-12 h-12 text-red-500 mx-auto mb-4 text-4xl">✕</div>
            <p className="text-slate-600">Giriş başarısız. Yönlendiriliyorsunuz...</p>
          </>
        )}
      </div>
    </div>
  );
}
