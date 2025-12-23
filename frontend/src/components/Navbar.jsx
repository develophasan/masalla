import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  BookOpen, Menu, X, Plus, Library, Info, User, LogOut, 
  Coins, Shield, ChevronDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="glass sticky top-0 z-50 border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/logo.svg" 
              alt="Masal Sepeti" 
              className="h-12 w-auto"
            />
            <span className="text-2xl font-extrabold hidden sm:inline">
              <span className="bg-gradient-to-r from-violet-600 via-pink-500 to-orange-400 bg-clip-text text-transparent drop-shadow-sm">
                MASAL
              </span>
              <span className="bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-400 bg-clip-text text-transparent drop-shadow-sm ml-1">
                SEPETİ
              </span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {/* Credits Badge */}
            {isAuthenticated && (
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 px-3 py-1.5 rounded-full text-sm font-medium mr-2">
                <Coins className="w-4 h-4" />
                <span>{user?.credits || 0} Kredi</span>
              </div>
            )}

            <Link to="/create">
              <Button variant="ghost" className="text-slate-600 hover:text-violet-600 hover:bg-violet-50">
                <Plus className="w-4 h-4 mr-1.5" />
                Masal Ekle
              </Button>
            </Link>
            <Link to="/stories">
              <Button variant="ghost" className="text-slate-600 hover:text-violet-600 hover:bg-violet-50">
                <Library className="w-4 h-4 mr-1.5" />
                Tüm Masallar
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="ghost" className="text-slate-600 hover:text-violet-600 hover:bg-violet-50">
                <Info className="w-4 h-4 mr-1.5" />
                Hakkımızda
              </Button>
            </Link>

            {isAuthenticated ? (
              <div className="relative ml-2">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 bg-violet-50 hover:bg-violet-100 text-violet-700 px-3 py-2 rounded-full transition-colors"
                >
                  {user?.picture ? (
                    <img src={user.picture} alt="" className="w-6 h-6 rounded-full" />
                  ) : (
                    <User className="w-5 h-5" />
                  )}
                  <span className="font-medium text-sm">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-violet-50 hover:text-violet-600"
                    >
                      <User className="w-4 h-4" />
                      Profilim
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-violet-50 hover:text-violet-600"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                    <hr className="my-2 border-slate-100" />
                    <button
                      onClick={() => { handleLogout(); setUserMenuOpen(false); }}
                      className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button className="ml-2 bg-violet-500 hover:bg-violet-600 text-white rounded-full">
                  Giriş Yap
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated && (
              <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium">
                <Coins className="w-3 h-3" />
                {user?.credits || 0}
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-violet-600"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-purple-100">
            <div className="flex flex-col gap-2">
              <Link
                to="/create"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-violet-50 rounded-lg"
              >
                <Plus className="w-5 h-5" />
                Masal Ekle
              </Link>
              <Link
                to="/stories"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-violet-50 rounded-lg"
              >
                <Library className="w-5 h-5" />
                Tüm Masallar
              </Link>
              <Link
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-violet-50 rounded-lg"
              >
                <Info className="w-5 h-5" />
                Hakkımızda
              </Link>
              
              <hr className="my-2 border-slate-100" />
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-violet-50 rounded-lg"
                  >
                    <User className="w-5 h-5" />
                    Profilim
                  </Link>
                  {user?.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-violet-50 rounded-lg"
                    >
                      <Shield className="w-5 h-5" />
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg w-full text-left"
                  >
                    <LogOut className="w-5 h-5" />
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-lg font-medium"
                >
                  Giriş Yap
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
