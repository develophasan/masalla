// API configuration helper
// Uses runtime config (window.ENV) if available, falls back to build-time env var

export const getApiUrl = () => {
  // Priority: runtime config > build-time env var > empty string
  if (typeof window !== 'undefined' && window.ENV && window.ENV.REACT_APP_BACKEND_URL) {
    return `${window.ENV.REACT_APP_BACKEND_URL}/api`;
  }
  if (process.env.REACT_APP_BACKEND_URL) {
    return `${process.env.REACT_APP_BACKEND_URL}/api`;
  }
  // Fallback - will cause issues but prevents crashes
  console.error('REACT_APP_BACKEND_URL is not configured!');
  return '/api';
};

export const API = getApiUrl();
