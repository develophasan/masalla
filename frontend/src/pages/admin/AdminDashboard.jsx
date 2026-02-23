import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, authAxios } from '@/contexts/AuthContext';
import { 
  Shield, Users, BookOpen, Bell, LogOut, 
  Home, ChevronRight, Loader2, Mail, Phone, MessageSquare, Zap, ShoppingBag,
  Menu, X, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { API } from '@/config/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [stories, setStories] = useState([]);
  const [creditRequests, setCreditRequests] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (user && user.role !== 'admin') {
      toast.error('Admin yetkisi gerekli');
      navigate('/admin/login');
      return;
    }
    fetchStats();
  }, [authLoading, user, navigate]);

  const fetchStats = async () => {
    try {
      const response = await authAxios.get(`${API}/admin/stats`);
      setStats(response.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/admin/login');
        return;
      }
      toast.error('Veriler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await authAxios.get(`${API}/admin/users`);
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Kullanıcılar yüklenemedi');
    }
  };

  const fetchStories = async () => {
    try {
      const response = await authAxios.get(`${API}/admin/stories`);
      setStories(response.data.stories);
    } catch (error) {
      toast.error('Masallar yüklenemedi');
    }
  };

  const fetchCreditRequests = async () => {
    try {
      const response = await authAxios.get(`${API}/admin/credit-requests`);
      setCreditRequests(response.data);
    } catch (error) {
      toast.error('Talepler yüklenemedi');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    if (tab === 'users' && users.length === 0) fetchUsers();
    if (tab === 'stories' && stories.length === 0) fetchStories();
    if (tab === 'requests' && creditRequests.length === 0) fetchCreditRequests();
  };

  const handleUpdateCredits = async (userId, credits) => {
    try {
      await authAxios.put(`${API}/admin/users/${userId}`, { credits: parseInt(credits) });
      toast.success('Kredi güncellendi');
      fetchUsers();
    } catch (error) {
      toast.error('Güncelleme başarısız');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;
    try {
      await authAxios.delete(`${API}/admin/users/${userId}`);
      toast.success('Kullanıcı silindi');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Silme başarısız');
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (!window.confirm('Bu masalı silmek istediğinizden emin misiniz?')) return;
    try {
      await authAxios.delete(`${API}/admin/stories/${storyId}`);
      toast.success('Masal silindi');
      fetchStories();
    } catch (error) {
      toast.error('Silme başarısız');
    }
  };

  const handleApproveRequest = async (requestId, userId, credits) => {
    try {
      await authAxios.put(`${API}/admin/credit-requests/${requestId}`, { status: 'approved', credits });
      toast.success('Talep onaylandı');
      fetchCreditRequests();
      fetchStats();
    } catch (error) {
      toast.error('Onaylama başarısız');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await authAxios.put(`${API}/admin/credit-requests/${requestId}`, { status: 'rejected' });
      toast.success('Talep reddedildi');
      fetchCreditRequests();
    } catch (error) {
      toast.error('İşlem başarısız');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  const NavItem = ({ icon: Icon, label, tab, badge, color }) => (
    <button
      onClick={() => handleTabChange(tab)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
        activeTab === tab ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-slate-700'
      }`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${color || ''}`} />
      <span className="truncate">{label}</span>
      {badge > 0 && (
        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );

  const NavLink = ({ to, icon: Icon, label, color }) => (
    <Link
      to={to}
      onClick={() => setSidebarOpen(false)}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-slate-300 hover:bg-slate-700"
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${color || ''}`} />
      <span className="truncate">{label}</span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-800 border-b border-slate-700">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-violet-500" />
            <span className="text-white font-bold">Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-slate-300 hover:bg-slate-700 rounded-lg"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-slate-800 transform transition-transform duration-300
        lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-4">
          {/* Logo - Hidden on mobile (shown in header) */}
          <div className="hidden lg:flex items-center gap-3 mb-8 px-2">
            <Shield className="w-8 h-8 text-violet-500" />
            <span className="text-white font-bold text-lg">Admin Panel</span>
          </div>
          
          {/* Mobile spacer for header */}
          <div className="h-14 lg:hidden" />

          <nav className="flex-1 space-y-1 overflow-y-auto">
            <NavItem icon={Home} label="Dashboard" tab="dashboard" />
            <NavItem icon={Users} label="Kullanıcılar" tab="users" />
            <NavItem icon={BookOpen} label="Masallar" tab="stories" />
            <NavItem icon={Bell} label="Kredi Talepleri" tab="requests" badge={stats?.pending_requests} />
            <div className="py-2">
              <div className="border-t border-slate-700" />
            </div>
            <NavLink to="/admin/bulk-generate" icon={Zap} label="Toplu Üretim" color="text-amber-400" />
            <NavLink to="/admin/store" icon={ShoppingBag} label="Mağaza Yönetimi" color="text-emerald-400" />
          </nav>

          <div className="border-t border-slate-700 pt-4 mt-4 space-y-1">
            <Link 
              to="/" 
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
              <span>Siteye Dön</span>
            </Link>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-700 rounded-lg"
            >
              <LogOut className="w-5 h-5" />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Dashboard</h1>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
                <div className="bg-slate-800 rounded-xl p-4 sm:p-6">
                  <Users className="w-6 sm:w-8 h-6 sm:h-8 text-violet-400 mb-2 sm:mb-3" />
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stats?.total_users || 0}</p>
                  <p className="text-slate-400 text-sm sm:text-base">Toplam Kullanıcı</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-4 sm:p-6">
                  <BookOpen className="w-6 sm:w-8 h-6 sm:h-8 text-pink-400 mb-2 sm:mb-3" />
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stats?.total_stories || 0}</p>
                  <p className="text-slate-400 text-sm sm:text-base">Toplam Masal</p>
                </div>
                <div className="bg-slate-800 rounded-xl p-4 sm:p-6">
                  <Bell className="w-6 sm:w-8 h-6 sm:h-8 text-amber-400 mb-2 sm:mb-3" />
                  <p className="text-2xl sm:text-3xl font-bold text-white">{stats?.pending_requests || 0}</p>
                  <p className="text-slate-400 text-sm sm:text-base">Bekleyen Talep</p>
                </div>
              </div>

              {/* Recent Users - Mobile Cards, Desktop Table */}
              <h2 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4">Son Kullanıcılar</h2>
              
              {/* Mobile View - Cards */}
              <div className="sm:hidden space-y-3">
                {stats?.recent_users?.map((user) => (
                  <div key={user.user_id} className="bg-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium">{user.name} {user.surname}</p>
                      <span className="text-amber-400 font-bold">{user.credits} kredi</span>
                    </div>
                    <p className="text-slate-400 text-sm truncate">{user.email}</p>
                    <p className="text-slate-500 text-xs mt-1">
                      {new Date(user.created_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden sm:block bg-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-slate-300 text-sm">Ad</th>
                        <th className="px-4 py-3 text-left text-slate-300 text-sm">Email</th>
                        <th className="px-4 py-3 text-left text-slate-300 text-sm">Kredi</th>
                        <th className="px-4 py-3 text-left text-slate-300 text-sm">Tarih</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats?.recent_users?.map((user) => (
                        <tr key={user.user_id} className="border-t border-slate-700">
                          <td className="px-4 py-3 text-white">{user.name} {user.surname}</td>
                          <td className="px-4 py-3 text-slate-400">{user.email}</td>
                          <td className="px-4 py-3 text-amber-400">{user.credits}</td>
                          <td className="px-4 py-3 text-slate-400 text-sm">
                            {new Date(user.created_at).toLocaleDateString('tr-TR')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Kullanıcı Yönetimi</h1>
              
              {/* Mobile View - Cards */}
              <div className="sm:hidden space-y-3">
                {users.map((u) => (
                  <div key={u.user_id} className="bg-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-white font-medium">{u.name} {u.surname}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 -mr-2"
                        onClick={() => handleDeleteUser(u.user_id)}
                      >
                        Sil
                      </Button>
                    </div>
                    <p className="text-slate-400 text-sm truncate mb-2">{u.email}</p>
                    {u.phone && <p className="text-slate-500 text-xs mb-2">{u.phone}</p>}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-sm">Kredi:</span>
                      <input
                        type="number"
                        defaultValue={u.credits}
                        className="w-20 bg-slate-700 text-white px-2 py-1 rounded text-sm"
                        onBlur={(e) => handleUpdateCredits(u.user_id, e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden sm:block bg-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-slate-300 text-sm">Kullanıcı</th>
                        <th className="px-4 py-3 text-left text-slate-300 text-sm">Email</th>
                        <th className="px-4 py-3 text-left text-slate-300 text-sm hidden md:table-cell">Telefon</th>
                        <th className="px-4 py-3 text-left text-slate-300 text-sm">Kredi</th>
                        <th className="px-4 py-3 text-left text-slate-300 text-sm">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.user_id} className="border-t border-slate-700">
                          <td className="px-4 py-3 text-white whitespace-nowrap">{u.name} {u.surname}</td>
                          <td className="px-4 py-3 text-slate-400 max-w-[200px] truncate">{u.email}</td>
                          <td className="px-4 py-3 text-slate-400 hidden md:table-cell">{u.phone || '-'}</td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              defaultValue={u.credits}
                              className="w-20 bg-slate-700 text-white px-2 py-1 rounded text-sm"
                              onBlur={(e) => handleUpdateCredits(u.user_id, e.target.value)}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              onClick={() => handleDeleteUser(u.user_id)}
                            >
                              Sil
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Stories Tab */}
          {activeTab === 'stories' && (
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Masal Yönetimi</h1>
              
              {/* Mobile View - Cards */}
              <div className="sm:hidden space-y-3">
                {stories.map((story) => (
                  <div key={story.id} className="bg-slate-800 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-white font-medium truncate">{story.title}</p>
                        <p className="text-slate-400 text-sm">{story.topic_name}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 -mr-2 flex-shrink-0"
                        onClick={() => handleDeleteStory(story.id)}
                      >
                        Sil
                      </Button>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">{story.play_count} dinleme</span>
                      <span className="text-slate-500">
                        {new Date(story.created_at).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View - Table */}
              <div className="hidden sm:block bg-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-700">
                      <tr>
                        <th className="px-4 py-3 text-left text-slate-300 text-sm">Başlık</th>
                        <th className="px-4 py-3 text-left text-slate-300 text-sm">Konu</th>
                        <th className="px-4 py-3 text-left text-slate-300 text-sm">Dinleme</th>
                        <th className="px-4 py-3 text-left text-slate-300 text-sm">Tarih</th>
                        <th className="px-4 py-3 text-left text-slate-300 text-sm">İşlem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stories.map((story) => (
                        <tr key={story.id} className="border-t border-slate-700">
                          <td className="px-4 py-3 text-white max-w-[250px] truncate">{story.title}</td>
                          <td className="px-4 py-3 text-slate-400">{story.topic_name}</td>
                          <td className="px-4 py-3 text-slate-400">{story.play_count}</td>
                          <td className="px-4 py-3 text-slate-400 text-sm whitespace-nowrap">
                            {new Date(story.created_at).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              onClick={() => handleDeleteStory(story.id)}
                            >
                              Sil
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Credit Requests Tab */}
          {activeTab === 'requests' && (
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Kredi Talepleri</h1>
              <div className="space-y-3 sm:space-y-4">
                {creditRequests.filter(r => r.status === 'pending').length === 0 ? (
                  <div className="bg-slate-800 rounded-xl p-6 sm:p-8 text-center">
                    <Bell className="w-10 sm:w-12 h-10 sm:h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">Bekleyen talep yok</p>
                  </div>
                ) : (
                  creditRequests.filter(r => r.status === 'pending').map((req) => (
                    <div key={req.id} className="bg-slate-800 rounded-xl p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                        <div className="min-w-0">
                          <h3 className="text-white font-medium">{req.user_name}</h3>
                          <p className="text-slate-400 text-sm truncate">{req.user_email}</p>
                          {req.user_phone && (
                            <p className="text-slate-400 text-sm">{req.user_phone}</p>
                          )}
                        </div>
                        <span className="self-start bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm whitespace-nowrap">
                          {req.requested_credits} Kredi
                        </span>
                      </div>
                      
                      {req.message && (
                        <div className="bg-slate-700 rounded-lg p-3 mb-3 sm:mb-4">
                          <p className="text-slate-300 text-sm flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 mt-0.5 text-slate-500 flex-shrink-0" />
                            <span>{req.message}</span>
                          </p>
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <Button
                          onClick={() => handleApproveRequest(req.id, req.user_id, req.requested_credits)}
                          className="bg-green-600 hover:bg-green-700 flex-1 sm:flex-none"
                          size="sm"
                        >
                          Onayla
                        </Button>
                        <Button
                          onClick={() => handleRejectRequest(req.id)}
                          variant="outline"
                          className="border-red-500 text-red-400 hover:bg-red-500/10 flex-1 sm:flex-none"
                          size="sm"
                        >
                          Reddet
                        </Button>
                        <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-3 mt-2 sm:mt-0">
                          <a
                            href={`mailto:${req.user_email}?subject=Masal Sepeti Kredi Talebi&body=Merhaba ${req.user_name},%0A%0AKredi talebiniz ile ilgili...`}
                            className="flex items-center gap-1 text-slate-400 hover:text-violet-400 text-sm"
                          >
                            <Mail className="w-4 h-4" />
                            <span className="hidden sm:inline">Mail</span>
                          </a>
                          {req.user_phone && (
                            <a
                              href={`https://wa.me/${req.user_phone.replace(/[^0-9]/g, '')}?text=Merhaba ${req.user_name}, Masal Sepeti kredi talebiniz ile ilgili...`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-slate-400 hover:text-green-400 text-sm"
                            >
                              <Phone className="w-4 h-4" />
                              <span className="hidden sm:inline">WhatsApp</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {creditRequests.filter(r => r.status !== 'pending').length > 0 && (
                  <>
                    <h2 className="text-base sm:text-lg font-bold text-white mt-6 sm:mt-8 mb-3 sm:mb-4">Geçmiş Talepler</h2>
                    {creditRequests.filter(r => r.status !== 'pending').map((req) => (
                      <div key={req.id} className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="text-white truncate">{req.user_name}</p>
                          <p className="text-slate-500 text-sm">{req.requested_credits} kredi</p>
                        </div>
                        <span className={`ml-3 px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                          req.status === 'approved' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {req.status === 'approved' ? 'Onaylandı' : 'Reddedildi'}
                        </span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
