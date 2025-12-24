import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, authAxios } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import { 
  User, Mail, Phone, Edit2, Save, X, Coins, Plus, 
  BookOpen, Trash2, Clock, Play, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { API } from '@/config/api';

export default function ProfilePage() {
  const { user, updateUser, refreshUser, isAuthenticated } = useAuth();
  const [editing, setEditing] = useState(false);
  const [stories, setStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: ''
  });
  const [showCreditRequest, setShowCreditRequest] = useState(false);
  const [creditMessage, setCreditMessage] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        surname: user.surname || '',
        phone: user.phone || ''
      });
      fetchUserStories();
    }
  }, [user]);

  const fetchUserStories = async () => {
    try {
      const response = await authAxios.get(`${API}/users/stories`, {
        
      });
      setStories(response.data);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoadingStories(false);
    }
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const response = await authAxios.put(`${API}/users/profile`, formData, {
        
      });
      updateUser(response.data.user);
      setEditing(false);
      toast.success('Profil güncellendi');
    } catch (error) {
      toast.error('Profil güncellenemedi');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (!window.confirm('Bu masalı silmek istediğinizden emin misiniz?')) return;
    
    try {
      await authAxios.delete(`${API}/users/stories/${storyId}`, {
        
      });
      setStories(stories.filter(s => s.id !== storyId));
      toast.success('Masal silindi');
    } catch (error) {
      toast.error('Masal silinemedi');
    }
  };

  const handleCreditRequest = async () => {
    try {
      await authAxios.post(`${API}/credits/request`, {
        requested_credits: 10,
        message: creditMessage
      }, {  });
      toast.success('Kredi talebiniz oluşturuldu!');
      setShowCreditRequest(false);
      setCreditMessage('');
    } catch (error) {
      toast.error('Talep oluşturulamadı');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50 to-white">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-slate-500 mb-4">Profil sayfasını görmek için giriş yapın</p>
            <Link to="/login">
              <Button>Giriş Yap</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50 to-white">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-100">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {user?.picture ? (
                <img src={user.picture} alt="" className="w-20 h-20 rounded-full" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {user?.name} {user?.surname}
                </h1>
                <p className="text-slate-500">{user?.email}</p>
              </div>
            </div>
            {!editing ? (
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Edit2 className="w-4 h-4 mr-2" />
                Düzenle
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditing(false)}>
                  <X className="w-4 h-4" />
                </Button>
                <Button onClick={handleSaveProfile} disabled={savingProfile}>
                  {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Kaydet
                </Button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Ad</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Soyad</Label>
                <Input
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="md:col-span-2">
                <Label>Telefon</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-slate-600">
                <Mail className="w-5 h-5 text-slate-400" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-600">
                <Phone className="w-5 h-5 text-slate-400" />
                <span>{user?.phone || 'Belirtilmemiş'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Credits Card */}
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 mb-8 border border-amber-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                <Coins className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-amber-800 font-medium">Mevcut Krediniz</p>
                <p className="text-3xl font-bold text-amber-600">{user?.credits || 0}</p>
              </div>
            </div>
            {user?.credits <= 0 && (
              <Button
                onClick={() => setShowCreditRequest(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Kredi Talebi
              </Button>
            )}
          </div>

          {showCreditRequest && (
            <div className="mt-4 p-4 bg-white rounded-xl">
              <h3 className="font-medium text-slate-800 mb-2">Kredi Talebi Oluştur</h3>
              <textarea
                value={creditMessage}
                onChange={(e) => setCreditMessage(e.target.value)}
                placeholder="Mesajınız (isteğe bağlı)..."
                className="w-full p-3 border rounded-lg text-sm mb-3"
                rows={3}
              />
              <div className="flex gap-2">
                <Button onClick={handleCreditRequest} size="sm">Gönder</Button>
                <Button variant="outline" size="sm" onClick={() => setShowCreditRequest(false)}>Vazgeç</Button>
              </div>
            </div>
          )}
        </div>

        {/* User Stories */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-800">Masallarım</h2>
            <Link to="/create">
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Masal
              </Button>
            </Link>
          </div>

          {loadingStories ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 text-violet-500 animate-spin mx-auto" />
            </div>
          ) : stories.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Henüz masal oluşturmadınız</p>
              <Link to="/create" className="text-violet-600 hover:text-violet-700 font-medium text-sm">
                İlk masalınızı oluşturun
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {stories.map((story) => (
                <div key={story.id} className="bg-white rounded-xl p-4 border border-slate-100 flex items-center justify-between">
                  <Link to={`/stories/${story.id}`} className="flex-1">
                    <h3 className="font-medium text-slate-800 hover:text-violet-600">{story.title}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {story.duration ? `${Math.ceil(story.duration / 60)} dk` : '~5 dk'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Play className="w-4 h-4" />
                        {story.play_count} dinleme
                      </span>
                    </div>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDeleteStory(story.id)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
