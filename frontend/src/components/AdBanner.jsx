import { useEffect, useRef } from 'react';

// Horizontal banner ad for homepage
export const AdBanner = ({ slot = "auto", className = "" }) => {
  const adRef = useRef(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    if (adRef.current && !isLoaded.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isLoaded.current = true;
      } catch (e) {
        console.log('AdSense error:', e);
      }
    }
  }, []);

  return (
    <div className={`ad-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-1131412625965023"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;
