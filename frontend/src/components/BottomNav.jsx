import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Plus, Heart, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function BottomNav() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50 sm:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Home */}
        <Link 
          to="/" 
          className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors ${
            isActive('/') ? 'text-violet-600' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Ana Sayfa</span>
        </Link>

        {/* All Stories */}
        <Link 
          to="/stories" 
          className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors ${
            isActive('/stories') && !location.pathname.includes('/create') ? 'text-violet-600' : 'text-slate-500'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Masallar</span>
        </Link>

        {/* Create Story - Big Center Button */}
        <Link 
          to={isAuthenticated ? "/create" : "/login"}
          className="flex items-center justify-center -mt-6"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg border-4 border-white">
            <Plus className="w-7 h-7 text-white" />
          </div>
        </Link>

        {/* Favorites */}
        <Link 
          to={isAuthenticated ? "/profile?tab=favorites" : "/login"}
          className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors ${
            location.search.includes('favorites') ? 'text-red-500' : 'text-slate-500'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Favoriler</span>
        </Link>

        {/* Profile */}
        <Link 
          to={isAuthenticated ? "/profile" : "/login"}
          className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors ${
            isActive('/profile') && !location.search.includes('favorites') ? 'text-violet-600' : 'text-slate-500'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] mt-1 font-medium">Profil</span>
        </Link>
      </div>
    </nav>
  );
}
