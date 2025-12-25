import { useEffect, useRef } from 'react';

// Ezoic Banner Ad Component
export const AdBanner = ({ placeholderId = "101", className = "" }) => {
  const adRef = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    if (!isInitialized.current && window.ezstandalone) {
      isInitialized.current = true;
      
      // Initialize Ezoic ads
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
    }
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
