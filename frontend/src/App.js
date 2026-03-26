import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { queryClient } from "@/lib/queryClient";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import CookieConsent from "@/components/CookieConsent";
import HomePage from "@/pages/HomePage";
import StoryDetailPage from "@/pages/StoryDetailPage";
import StoryCreatePage from "@/pages/StoryCreatePage";
import StoryListPage from "@/pages/StoryListPage";
import TopicDetailPage from "@/pages/TopicDetailPage";
import StorePage from "@/pages/StorePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AuthCallback from "@/pages/AuthCallback";
import ProfilePage from "@/pages/ProfilePage";
import PublicProfilePage from "@/pages/PublicProfilePage";
import AboutPage from "@/pages/AboutPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";
import KVKKPage from "@/pages/KVKKPage";
import CookiePolicyPage from "@/pages/CookiePolicyPage";
import ContactPage from "@/pages/ContactPage";
import ApiDocsPage from "@/pages/ApiDocsPage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import BulkGeneratePage from "@/pages/admin/BulkGeneratePage";
import StoreManagementPage from "@/pages/admin/StoreManagementPage";

function AppRouter() {
  const location = useLocation();
  
  // Handle Google OAuth callback - check URL fragment for session_id
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }
  
  // Hide bottom nav on admin pages and auth pages
  const hideBottomNav = location.pathname.startsWith('/admin') || 
                        location.pathname === '/login' || 
                        location.pathname === '/register' ||
                        location.pathname === '/auth/callback' ||
                        location.pathname === '/auth/google/callback' ||
                        location.pathname === '/dev/api';

  // Hide footer on admin pages and auth pages
  const hideFooter = location.pathname.startsWith('/admin') || 
                     location.pathname === '/login' || 
                     location.pathname === '/register' ||
                     location.pathname === '/auth/callback' ||
                     location.pathname === '/auth/google/callback' ||
                     location.pathname === '/dev/api';
  
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/topics/:topicId" element={<TopicDetailPage />} />
          <Route path="/stories" element={<StoryListPage />} />
          {/* New SEO-friendly URL */}
          <Route path="/masal/:slug" element={<StoryDetailPage />} />
          {/* Legacy URL - redirect to new format */}
          <Route path="/stories/:id" element={<StoryDetailPage />} />
          <Route path="/create" element={<StoryCreatePage />} />
          <Route path="/magaza" element={<StorePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/auth/google/callback" element={<AuthCallback />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/user/:userId" element={<PublicProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/dev/api" element={<ApiDocsPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/bulk-generate" element={<BulkGeneratePage />} />
          <Route path="/admin/store" element={<StoreManagementPage />} />
        </Routes>
      </div>
      {!hideFooter && <Footer />}
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRouter />
          </AuthProvider>
        </BrowserRouter>
        <Toaster position="top-center" richColors />
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
