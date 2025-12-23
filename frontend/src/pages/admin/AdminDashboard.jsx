import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Shield, Users, BookOpen, Coins, Bell, LogOut, 
  Home, ChevronRight, Loader2, Mail, Phone, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [stories, setStories] = useState([]);
  const [creditRequests, setCreditRequests] = useState([]);

  useEffect(() => {
    // Wait for auth to load
    if (authLoading) return;
    
    // If no user or not admin, try fetching stats anyway (cookie might be valid)
    fetchStats();
  }, [authLoading]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/stats`, { withCredentials: true });
      setStats(response.data);
    } catch (error) {
      // If unauthorized, redirect to admin login
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
      const response = await axios.get(`${API}/admin/users`, { withCredentials: true });
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Kullanıcılar yüklenemedi');
    }
  };

  const fetchStories = async () => {
    try {
      const response = await axios.get(`${API}/admin/stories`, { withCredentials: true });
      setStories(response.data.stories);
    } catch (error) {
      toast.error('Masallar yüklenemedi');
    }
  };

  const fetchCreditRequests = async () => {
    try {
      const response = await axios.get(`${API}/admin/credit-requests`, { withCredentials: true });
      setCreditRequests(response.data);
    } catch (error) {
      toast.error('Talepler yüklenemedi');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'users' && users.length === 0) fetchUsers();
    if (tab === 'stories' && stories.length === 0) fetchStories();
    if (tab === 'requests' && creditRequests.length === 0) fetchCreditRequests();
  };

  const handleUpdateCredits = async (userId, credits) => {
    try {
      await axios.put(`${API}/admin/users/${userId}`, { credits: parseInt(credits) }, { withCredentials: true });
      toast.success('Kredi güncellendi');
      fetchUsers();
    } catch (error) {
      toast.error('Güncelleme başarısız');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) return;
    try {
      await axios.delete(`${API}/admin/users/${userId}`, { withCredentials: true });
      toast.success('Kullanıcı silindi');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Silme başarısız');
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (!window.confirm('Bu masalı silmek istediğinizden emin misiniz?')) return;
    try {
      await axios.delete(`${API}/admin/stories/${storyId}`, { withCredentials: true });
      toast.success('Masal silindi');
      fetchStories();
    } catch (error) {
      toast.error('Silme başarısız');
    }
  };

  const handleApproveRequest = async (requestId, userId, credits) => {
    try {
      await axios.put(`${API}/admin/credit-requests/${requestId}`, 
        { status: 'approved', credits },
        { withCredentials: true }
      );
      toast.success('Talep onaylandı');
      fetchCreditRequests();
      fetchStats();
    } catch (error) {
      toast.error('Onaylama başarısız');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await axios.put(`${API}/admin/credit-requests/${requestId}`, 
        { status: 'rejected' },
        { withCredentials: true }
      );
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

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 p-4 flex flex-col">
        <div className="flex items-center gap-3 mb-8 px-2">
          <Shield className="w-8 h-8 text-violet-500" />
          <span className="text-white font-bold text-lg">Admin Panel</span>
        </div>

        <nav className="flex-1 space-y-1">
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === 'dashboard' ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Home className="w-5 h-5" />
            Dashboard
          </button>
          <button
            onClick={() => handleTabChange('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === 'users' ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Users className="w-5 h-5" />
            Kullanıcılar
          </button>
          <button
            onClick={() => handleTabChange('stories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === 'stories' ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <BookOpen className="w-5 h-5" />
            Masallar
          </button>
          <button
            onClick={() => handleTabChange('requests')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              activeTab === 'requests' ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Bell className="w-5 h-5" />
            Kredi Talepleri
            {stats?.pending_requests > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {stats.pending_requests}
              </span>
            )}
          </button>
        </nav>

        <div className="border-t border-slate-700 pt-4 mt-4">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-700 rounded-lg">
            <ChevronRight className="w-5 h-5" />
            Siteye Dön
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-slate-700 rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            Çıkış Yap
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-slate-800 rounded-xl p-6">
                <Users className="w-8 h-8 text-violet-400 mb-3" />
                <p className="text-3xl font-bold text-white">{stats?.total_users || 0}</p>
                <p className="text-slate-400">Toplam Kullanıcı</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-6">
                <BookOpen className="w-8 h-8 text-pink-400 mb-3" />
                <p className="text-3xl font-bold text-white">{stats?.total_stories || 0}</p>
                <p className="text-slate-400">Toplam Masal</p>
              </div>
              <div className="bg-slate-800 rounded-xl p-6">
                <Bell className="w-8 h-8 text-amber-400 mb-3" />
                <p className="text-3xl font-bold text-white">{stats?.pending_requests || 0}</p>
                <p className="text-slate-400">Bekleyen Talep</p>
              </div>
            </div>

            <h2 className="text-lg font-bold text-white mb-4">Son Kullanıcılar</h2>
            <div className="bg-slate-800 rounded-xl overflow-hidden">
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
        )}

        {activeTab === 'users' && (
          <div>
            <h1 className="text-2xl font-bold text-white mb-6">Kullanıcı Yönetimi</h1>
            <div className="bg-slate-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-slate-300 text-sm">Kullanıcı</th>
                    <th className="px-4 py-3 text-left text-slate-300 text-sm">Email</th>
                    <th className="px-4 py-3 text-left text-slate-300 text-sm">Telefon</th>
                    <th className="px-4 py-3 text-left text-slate-300 text-sm">Kredi</th>
                    <th className="px-4 py-3 text-left text-slate-300 text-sm">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.user_id} className="border-t border-slate-700">
                      <td className="px-4 py-3 text-white">{u.name} {u.surname}</td>
                      <td className="px-4 py-3 text-slate-400">{u.email}</td>
                      <td className="px-4 py-3 text-slate-400">{u.phone || '-'}</td>
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
        )}

        {activeTab === 'stories' && (
          <div>
            <h1 className="text-2xl font-bold text-white mb-6">Masal Yönetimi</h1>
            <div className="bg-slate-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-slate-300 text-sm">Başlık</th>
                    <th className="px-4 py-3 text-left text-slate-300 text-sm">Konu</th>
                    <th className="px-4 py-3 text-left text-slate-300 text-sm">Dinleme</th>
                    <th className="px-4 py-3 text-left text-slate-300 text-sm">Tarih</th>
                    <th className="px-4 py-3 text-left text-slate-300 text-sm">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {stories.map((story) => (
                    <tr key={story.id} className="border-t border-slate-700">
                      <td className="px-4 py-3 text-white">{story.title}</td>
                      <td className="px-4 py-3 text-slate-400">{story.topic_name}</td>
                      <td className="px-4 py-3 text-slate-400">{story.play_count}</td>
                      <td className="px-4 py-3 text-slate-400 text-sm">
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
        )}

        {activeTab === 'requests' && (
          <div>
            <h1 className="text-2xl font-bold text-white mb-6">Kredi Talepleri</h1>
            <div className="space-y-4">
              {creditRequests.filter(r => r.status === 'pending').length === 0 ? (
                <div className="bg-slate-800 rounded-xl p-8 text-center">
                  <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400">Bekleyen talep yok</p>
                </div>
              ) : (
                creditRequests.filter(r => r.status === 'pending').map((req) => (
                  <div key={req.id} className="bg-slate-800 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-white font-medium">{req.user_name}</h3>
                        <p className="text-slate-400 text-sm">{req.user_email}</p>
                        {req.user_phone && (
                          <p className="text-slate-400 text-sm">{req.user_phone}</p>
                        )}
                      </div>
                      <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm">
                        {req.requested_credits} Kredi Talebi
                      </span>
                    </div>
                    {req.message && (
                      <div className="bg-slate-700 rounded-lg p-3 mb-4">
                        <p className="text-slate-300 text-sm flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 mt-0.5 text-slate-500" />
                          {req.message}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => handleApproveRequest(req.id, req.user_id, req.requested_credits)}
                        className="bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        Onayla
                      </Button>
                      <Button
                        onClick={() => handleRejectRequest(req.id)}
                        variant="outline"
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                        size="sm"
                      >
                        Reddet
                      </Button>
                      <a
                        href={`mailto:${req.user_email}?subject=Masal Sepeti Kredi Talebi&body=Merhaba ${req.user_name},%0A%0AKredi talebiniz ile ilgili...`}
                        className="flex items-center gap-1 text-slate-400 hover:text-violet-400 text-sm ml-auto"
                      >
                        <Mail className="w-4 h-4" />
                        Mail Gönder
                      </a>
                      {req.user_phone && (
                        <a
                          href={`https://wa.me/${req.user_phone.replace(/[^0-9]/g, '')}?text=Merhaba ${req.user_name}, Masal Sepeti kredi talebiniz ile ilgili...`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-slate-400 hover:text-green-400 text-sm"
                        >
                          <Phone className="w-4 h-4" />
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}

              {creditRequests.filter(r => r.status !== 'pending').length > 0 && (
                <>
                  <h2 className="text-lg font-bold text-white mt-8 mb-4">Geçmiş Talepler</h2>
                  {creditRequests.filter(r => r.status !== 'pending').map((req) => (
                    <div key={req.id} className="bg-slate-800/50 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <p className="text-white">{req.user_name}</p>
                        <p className="text-slate-500 text-sm">{req.requested_credits} kredi</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
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
    </div>
  );
}
