import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { User, BookOpen, Clock, Play, Calendar, Loader2 } from 'lucide-react';
import Navbar from '@/components/Navbar';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PublicProfilePage() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/users/public/${userId}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Kullanıcı bulunamadı');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50 to-white">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-purple-50 to-white">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <p className="text-slate-500 mb-4">{error}</p>
            <Link to="/" className="text-violet-600 hover:text-violet-700">
              Ana Sayfaya Dön
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
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-slate-100">
          <div className="flex items-center gap-4">
            {profile?.picture ? (
              <img src={profile.picture} alt="" className="w-20 h-20 rounded-full" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-400 to-pink-400 flex items-center justify-center">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {profile?.name} {profile?.surname}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(profile?.member_since)} tarihinden beri üye
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  {profile?.story_count || 0} masal
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* User's Stories */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-6">
            {profile?.name}'ın Masalları
          </h2>

          {profile?.stories?.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Henüz masal oluşturmamış</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {profile?.stories?.map((story) => (
                <Link 
                  key={story.id} 
                  to={`/stories/${story.id}`}
                  className="bg-white rounded-xl p-4 border border-slate-100 hover:border-violet-200 hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-800 group-hover:text-violet-600 transition-colors">
                      {story.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                      <span className="text-violet-500 font-medium">{story.topic_name}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {story.duration ? `${Math.ceil(story.duration / 60)} dk` : '~5 dk'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Play className="w-4 h-4" />
                        {story.play_count} dinleme
                      </span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-4 h-4 ml-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
