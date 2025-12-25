import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";
import HomePage from "@/pages/HomePage";
import StoryDetailPage from "@/pages/StoryDetailPage";
import StoryCreatePage from "@/pages/StoryCreatePage";
import StoryListPage from "@/pages/StoryListPage";
import TopicDetailPage from "@/pages/TopicDetailPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AuthCallback from "@/pages/AuthCallback";
import ProfilePage from "@/pages/ProfilePage";
import PublicProfilePage from "@/pages/PublicProfilePage";
import AboutPage from "@/pages/AboutPage";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";

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
                        location.pathname === '/auth/callback';
  
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/topics/:topicId" element={<TopicDetailPage />} />
        <Route path="/stories" element={<StoryListPage />} />
        {/* New SEO-friendly URL */}
        <Route path="/masal/:slug" element={<StoryDetailPage />} />
        {/* Legacy URL - redirect to new format */}
        <Route path="/stories/:id" element={<StoryDetailPage />} />
        <Route path="/create" element={<StoryCreatePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/user/:userId" element={<PublicProfilePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      {!hideBottomNav && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <BrowserRouter>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
