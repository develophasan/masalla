import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, authAxios } from '@/contexts/AuthContext';
import { 
  Play, Square, Trash2, Plus, Loader2, Terminal, 
  ChevronLeft, Settings, Zap, CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { API } from '@/config/api';

const AGE_GROUPS = ["3-4", "4-6", "6-8"];

const THEMES = [
  "macera", "dostluk", "cesaret", "yardımlaşma", "doğa sevgisi",
  "aile sevgisi", "paylaşma", "dürüstlük", "sabır", "özgüven",
  "merak", "keşif", "hayvan dostluğu", "orman macerası", "deniz macerası"
];

const CHARACTERS = [
  "küçük tavşan", "cesur sincap", "akıllı baykuş", "neşeli kedi",
  "yardımsever köpek", "meraklı fare", "renkli kelebek", "çalışkan karınca",
  "güçlü ayı", "hızlı tilki", "sevimli kirpi", "akıllı papağan"
];

export default function BulkGeneratePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const logsEndRef = useRef(null);
  
  const [presets, setPresets] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState({
    is_running: false,
    completed: 0,
    failed: 0,
    total_tasks: 0,
    current_index: 0,
    logs: [],
    current_task: null
  });
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  // New task form
  const [newTask, setNewTask] = useState({
    topic_id: '',
    subtopic_id: '',
    theme: THEMES[0],
    age_group: AGE_GROUPS[1],
    character: ''
  });

  const fetchPresets = useCallback(async () => {
    try {
      const response = await authAxios.get(`${API}/admin/generation-presets`);
      setPresets(response.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        navigate('/admin/login');
        return;
      }
      toast.error('Önayarlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await authAxios.get(`${API}/admin/bulk-generate/status`);
      setStatus(response.data);
      if (!response.data.is_running) {
        setPolling(false);
      }
    } catch (error) {
      console.error('Status fetch error:', error);
    }
  };

  const addTask = () => {
    if (!newTask.topic_id || !newTask.theme) {
      toast.error('Konu ve tema seçimi zorunludur');
      return;
    }
    
    const topic = presets.find(p => p.topic_id === newTask.topic_id);
    const subtopic = topic?.subtopics?.find(s => s.id === newTask.subtopic_id);
    
    setTasks([...tasks, {
      ...newTask,
      topic_name: topic?.topic_name,
      subtopic_name: subtopic?.name,
      id: Date.now()
    }]);
    
    // Reset form but keep topic
    setNewTask({
      ...newTask,
      subtopic_id: '',
      theme: THEMES[Math.floor(Math.random() * THEMES.length)],
      character: CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)]
    });
  };

  const removeTask = (taskId) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const clearTasks = () => {
    setTasks([]);
  };

  const addBulkTasks = (count = 5) => {
    if (!newTask.topic_id) {
      toast.error('Önce bir konu seçin');
      return;
    }
    
    const topic = presets.find(p => p.topic_id === newTask.topic_id);
    const newTasks = [];
    
    for (let i = 0; i < count; i++) {
      const subtopic = topic?.subtopics?.[i % topic.subtopics.length];
      newTasks.push({
        topic_id: newTask.topic_id,
        subtopic_id: subtopic?.id || '',
        theme: THEMES[i % THEMES.length],
        age_group: AGE_GROUPS[i % AGE_GROUPS.length],
        character: CHARACTERS[i % CHARACTERS.length],
        topic_name: topic?.topic_name,
        subtopic_name: subtopic?.name,
        id: Date.now() + i
      });
    }
    
    setTasks([...tasks, ...newTasks]);
    toast.success(`${count} görev eklendi`);
  };

  const startGeneration = async () => {
    if (tasks.length === 0) {
      toast.error('En az bir görev ekleyin');
      return;
    }
    
    try {
      const apiTasks = tasks.map(t => ({
        topic_id: t.topic_id,
        subtopic_id: t.subtopic_id || null,
        theme: t.theme,
        age_group: t.age_group,
        character: t.character || null
      }));
      
      await authAxios.post(`${API}/admin/bulk-generate/start`, { tasks: apiTasks });
      setPolling(true);
      toast.success('Üretim başlatıldı');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Başlatma hatası');
    }
  };

  const stopGeneration = async () => {
    try {
      await authAxios.post(`${API}/admin/bulk-generate/stop`);
      toast.success('Durdurma isteği gönderildi');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Durdurma hatası');
    }
  };

  const clearLogs = async () => {
    try {
      await authAxios.post(`${API}/admin/bulk-generate/clear-logs`);
      fetchStatus();
    } catch (error) {
      toast.error('Loglar temizlenemedi');
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default: return <Terminal className="w-4 h-4 text-slate-400" />;
    }
  };

  const getLogColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-amber-400';
      default: return 'text-slate-300';
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin')}
            className="text-slate-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Admin Panel
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-400" />
              Toplu Masal Üretimi
            </h1>
            <p className="text-slate-400 text-sm">Sıralı ve kontrollü masal üretimi</p>
          </div>
        </div>
        
        {/* Status indicators */}
        <div className="flex items-center gap-4">
          {status.is_running && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm">
                Çalışıyor ({status.current_index}/{status.total_tasks})
              </span>
            </div>
          )}
          <div className="text-sm text-slate-400">
            <span className="text-green-400">{status.completed}</span> başarılı, 
            <span className="text-red-400 ml-1">{status.failed}</span> başarısız
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Task Builder */}
        <div className="space-y-4">
          {/* Add Task Form */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-violet-400" />
              Görev Ekle
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Topic */}
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Konu *</label>
                <select
                  value={newTask.topic_id}
                  onChange={(e) => setNewTask({...newTask, topic_id: e.target.value, subtopic_id: ''})}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-violet-500 outline-none"
                >
                  <option value="">Seçin...</option>
                  {presets.map(p => (
                    <option key={p.topic_id} value={p.topic_id}>{p.topic_name}</option>
                  ))}
                </select>
              </div>
              
              {/* Subtopic */}
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Alt Konu</label>
                <select
                  value={newTask.subtopic_id}
                  onChange={(e) => setNewTask({...newTask, subtopic_id: e.target.value})}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-violet-500 outline-none"
                  disabled={!newTask.topic_id}
                >
                  <option value="">Seçin (opsiyonel)</option>
                  {presets.find(p => p.topic_id === newTask.topic_id)?.subtopics?.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Theme */}
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Tema *</label>
                <select
                  value={newTask.theme}
                  onChange={(e) => setNewTask({...newTask, theme: e.target.value})}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-violet-500 outline-none"
                >
                  {THEMES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              
              {/* Age Group */}
              <div>
                <label className="text-slate-400 text-xs mb-1 block">Yaş Grubu *</label>
                <select
                  value={newTask.age_group}
                  onChange={(e) => setNewTask({...newTask, age_group: e.target.value})}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-violet-500 outline-none"
                >
                  {AGE_GROUPS.map(a => (
                    <option key={a} value={a}>{a} yaş</option>
                  ))}
                </select>
              </div>
              
              {/* Character */}
              <div className="col-span-2">
                <label className="text-slate-400 text-xs mb-1 block">Karakter</label>
                <select
                  value={newTask.character}
                  onChange={(e) => setNewTask({...newTask, character: e.target.value})}
                  className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:border-violet-500 outline-none"
                >
                  <option value="">Otomatik</option>
                  {CHARACTERS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button onClick={addTask} size="sm" className="bg-violet-600 hover:bg-violet-700">
                <Plus className="w-4 h-4 mr-1" />
                Ekle
              </Button>
              <Button onClick={() => addBulkTasks(5)} size="sm" variant="outline" className="border-slate-600">
                +5 Toplu
              </Button>
              <Button onClick={() => addBulkTasks(10)} size="sm" variant="outline" className="border-slate-600">
                +10 Toplu
              </Button>
            </div>
          </div>

          {/* Task List */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 max-h-[400px] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">
                Görevler ({tasks.length})
              </h2>
              {tasks.length > 0 && (
                <Button onClick={clearTasks} size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                  <Trash2 className="w-4 h-4 mr-1" />
                  Temizle
                </Button>
              )}
            </div>
            
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Terminal className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Henüz görev eklenmedi</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task, index) => (
                  <div 
                    key={task.id} 
                    className="bg-slate-700/50 rounded-lg p-3 flex items-center justify-between group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-xs">#{index + 1}</span>
                        <span className="text-white text-sm font-medium">{task.topic_name}</span>
                        {task.subtopic_name && (
                          <span className="text-slate-400 text-xs">/ {task.subtopic_name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-violet-400 text-xs">{task.theme}</span>
                        <span className="text-slate-500 text-xs">•</span>
                        <span className="text-slate-400 text-xs">{task.age_group} yaş</span>
                        {task.character && (
                          <>
                            <span className="text-slate-500 text-xs">•</span>
                            <span className="text-amber-400 text-xs">{task.character}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <Button
                      onClick={() => removeTask(task.id)}
                      size="sm"
                      variant="ghost"
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {!status.is_running ? (
              <Button 
                onClick={startGeneration} 
                disabled={tasks.length === 0}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Başlat ({tasks.length} görev)
              </Button>
            ) : (
              <Button 
                onClick={stopGeneration}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <Square className="w-4 h-4 mr-2" />
                Durdur
              </Button>
            )}
          </div>
        </div>

        {/* Right: Terminal Logs */}
        <div className="bg-slate-950 rounded-xl border border-slate-700 flex flex-col h-[600px]">
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700 bg-slate-900 rounded-t-xl">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-slate-400 text-sm ml-2">Üretim Logları</span>
            </div>
            <Button onClick={clearLogs} size="sm" variant="ghost" className="text-slate-400 hover:text-white h-6 px-2">
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
          
          {/* Terminal Body */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
            {status.logs.length === 0 ? (
              <div className="text-slate-600">
                <p>$ masal-generator --ready</p>
                <p className="text-green-400">Üretim başlatılmayı bekliyor...</p>
              </div>
            ) : (
              <div className="space-y-1">
                {status.logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <span className="text-slate-600 text-xs">[{log.timestamp}]</span>
                    {getLogIcon(log.type)}
                    <span className={getLogColor(log.type)}>{log.message}</span>
                  </div>
                ))}
                <div ref={logsEndRef} />
              </div>
            )}
          </div>
          
          {/* Current Task */}
          {status.current_task && (
            <div className="px-4 py-2 border-t border-slate-700 bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                <span className="text-slate-400 text-xs">
                  Şu an: <span className="text-white">{status.current_task.topic}</span>
                  {status.current_task.subtopic && <span className="text-slate-500"> / {status.current_task.subtopic}</span>}
                  <span className="text-violet-400"> - {status.current_task.theme}</span>
                </span>
              </div>
            </div>
          )}
          
          {/* Progress Bar */}
          {status.total_tasks > 0 && (
            <div className="px-4 py-2 border-t border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>İlerleme</span>
                <span>{status.current_index} / {status.total_tasks}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-violet-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(status.current_index / status.total_tasks) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
