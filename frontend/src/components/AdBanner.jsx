import { useEffect, useRef } from 'react';

// Ezoic Banner Ad Component
export const AdBanner = ({ placeholderId = "101", className = "" }) => {
  const adRef = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    // Only run Ezoic in production
    if (typeof window === 'undefined') return;
    
    const initEzoic = () => {
      if (!isInitialized.current && window.ezstandalone) {
        isInitialized.current = true;
        
        try {
          window.ezstandalone.cmd.push(function() {
            if (window.ezstandalone.define) {
              window.ezstandalone.define(parseInt(placeholderId));
            }
            if (window.ezstandalone.enable) {
              window.ezstandalone.enable();
            }
            if (window.ezstandalone.display) {
              window.ezstandalone.display();
            }
          });
        } catch (e) {
          console.log('Ezoic not available:', e);
        }
      }
    };

    // Small delay to ensure scripts are loaded
    const timer = setTimeout(initEzoic, 500);
    return () => clearTimeout(timer);
  }, [placeholderId]);

  return (
    <div className={`ad-container ${className}`}>
      <div 
        ref={adRef}
        id={`ezoic-pub-ad-placeholder-${placeholderId}`}
        style={{ minHeight: '90px', width: '100%' }}
      />
    </div>
  );
};

export default AdBanner;
