import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Plus, Trash2, Edit2, Save, X, GripVertical, ChevronDown, ChevronUp,
  Eye, EyeOff, ExternalLink, Sparkles, BookOpen, Baby, Puzzle, Palette,
  Headphones, Laptop, Gift, Star, Heart, Music, Lamp, GraduationCap,
  TreePine, Crown, Flame, ArrowLeft, Settings, Package, AlertCircle, Check,
  RefreshCw, Database
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { API } from "@/config/api";

const AMAZON_TAG = 'masalspace-21';

// Icon mapping
const ICON_OPTIONS = {
  BookOpen: BookOpen,
  Baby: Baby,
  Puzzle: Puzzle,
  Palette: Palette,
  Headphones: Headphones,
  Laptop: Laptop,
  Gift: Gift,
  Star: Star,
  Heart: Heart,
  Music: Music,
  Lamp: Lamp,
  GraduationCap: GraduationCap,
  TreePine: TreePine,
  Crown: Crown,
  Sparkles: Sparkles,
  Package: Package
};

// Gradient options
const GRADIENT_OPTIONS = [
  { value: 'from-violet-500 to-purple-600', label: 'Mor' },
  { value: 'from-pink-500 to-rose-600', label: 'Pembe' },
  { value: 'from-emerald-500 to-green-600', label: 'Yeşil' },
  { value: 'from-sky-500 to-blue-600', label: 'Mavi' },
  { value: 'from-amber-500 to-orange-600', label: 'Turuncu' },
  { value: 'from-fuchsia-500 to-pink-600', label: 'Fuşya' },
  { value: 'from-indigo-500 to-blue-600', label: 'İndigo' },
  { value: 'from-teal-500 to-cyan-600', label: 'Turkuaz' },
  { value: 'from-rose-500 to-red-600', label: 'Kırmızı' },
  { value: 'from-yellow-500 to-amber-600', label: 'Sarı' },
  { value: 'from-blue-500 to-cyan-500', label: 'Açık Mavi' },
  { value: 'from-green-500 to-lime-600', label: 'Açık Yeşil' },
];

// Badge options
const BADGE_OPTIONS = ['En Çok Satan', 'Popüler', 'Yeni', 'Tavsiye', 'Önerilen', 'Trend', 'Seçili'];

export default function StoreManagementPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [activeTab, setActiveTab] = useState('categories');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingFeatured, setEditingFeatured] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [message, setMessage] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [storeStatus, setStoreStatus] = useState({ has_data: false, categories_count: 0, featured_count: 0 });

  // Check admin auth
  useEffect(() => {
    const adminToken = localStorage.getItem('session_token');
    if (!adminToken) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('session_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, featRes, statusRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/store/categories`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/api/admin/store/featured`, { headers: getAuthHeaders() }),
        fetch(`${API_URL}/api/admin/store/status`, { headers: getAuthHeaders() })
      ]);

      if (catRes.ok) {
        const catData = await catRes.json();
        setCategories(catData);
      }

      if (featRes.ok) {
        const featData = await featRes.json();
        setFeatured(featData);
      }

      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setStoreStatus(statusData);
      }
    } catch (error) {
      console.error('Error fetching store data:', error);
      showMessage('Veriler yüklenirken hata oluştu', 'error');
    }
    setLoading(false);
  };

  const handleResetToDefaults = async () => {
    if (!confirm('Tüm mağaza verileri silinip varsayılan verilerle değiştirilecek. Emin misiniz?')) return;

    setResetting(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/store/reset-defaults`, {
        method: 'POST',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        const data = await res.json();
        showMessage(`${data.categories_count} kategori ve ${data.featured_count} öne çıkan ürün eklendi`);
        await fetchData();
      } else {
        const error = await res.json();
        showMessage(error.detail || 'Hata oluştu', 'error');
      }
    } catch (error) {
      showMessage('Varsayılana dönme hatası', 'error');
    }
    setResetting(false);
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // Category CRUD
  const handleSaveCategory = async (category) => {
    setSaving(true);
    try {
      const isNew = !category.id;
      const url = isNew 
        ? `${API_URL}/api/admin/store/categories`
        : `${API_URL}/api/admin/store/categories/${category.id}`;
      
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(category)
      });

      if (res.ok) {
        showMessage(isNew ? 'Kategori eklendi' : 'Kategori güncellendi');
        await fetchData();
        setEditingCategory(null);
      } else {
        const error = await res.json();
        showMessage(error.detail || 'Hata oluştu', 'error');
      }
    } catch (error) {
      showMessage('Kaydetme hatası', 'error');
    }
    setSaving(false);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/store/categories/${categoryId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        showMessage('Kategori silindi');
        await fetchData();
      }
    } catch (error) {
      showMessage('Silme hatası', 'error');
    }
  };

  // Featured CRUD
  const handleSaveFeatured = async (item) => {
    setSaving(true);
    try {
      const isNew = !item.id;
      const url = isNew 
        ? `${API_URL}/api/admin/store/featured`
        : `${API_URL}/api/admin/store/featured/${item.id}`;
      
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(item)
      });

      if (res.ok) {
        showMessage(isNew ? 'Öne çıkan eklendi' : 'Öne çıkan güncellendi');
        await fetchData();
        setEditingFeatured(null);
      } else {
        const error = await res.json();
        showMessage(error.detail || 'Hata oluştu', 'error');
      }
    } catch (error) {
      showMessage('Kaydetme hatası', 'error');
    }
    setSaving(false);
  };

  const handleDeleteFeatured = async (itemId) => {
    if (!confirm('Bu öğeyi silmek istediğinize emin misiniz?')) return;

    try {
      const res = await fetch(`${API_URL}/api/admin/store/featured/${itemId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (res.ok) {
        showMessage('Öğe silindi');
        await fetchData();
      }
    } catch (error) {
      showMessage('Silme hatası', 'error');
    }
  };

  const createAmazonLink = (query) => {
    const encodedQuery = encodeURIComponent(query);
    return `https://www.amazon.com.tr/s?k=${encodedQuery}&tag=${AMAZON_TAG}`;
  };

  const toggleExpand = (catId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // New category template
  const newCategoryTemplate = {
    title: '',
    description: '',
    icon: 'BookOpen',
    gradient: 'from-violet-500 to-purple-600',
    bgColor: 'bg-violet-50',
    products: [],
    isActive: true
  };

  // New featured template
  const newFeaturedTemplate = {
    title: '',
    description: '',
    query: '',
    badge: 'Önerilen',
    gradient: 'from-violet-500 to-purple-600',
    isActive: true
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Helmet>
        <title>Mağaza Yönetimi | Admin Panel</title>
      </Helmet>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/admin')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Mağaza Yönetimi</h1>
                <p className="text-sm text-slate-500">Öneri Mağazası içeriklerini düzenle</p>
              </div>
            </div>
            <a
              href="/magaza"
              target="_blank"
              className="flex items-center gap-2 text-sm text-violet-600 hover:text-violet-700"
            >
              <ExternalLink className="w-4 h-4" />
              Mağazayı Görüntüle
            </a>
          </div>
        </div>
      </header>

      {/* Message Toast */}
      {message && (
        <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in ${
          message.type === 'error' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
        }`}>
          {message.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <Check className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Status Banner - Show if no data */}
        {!storeStatus.has_data && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">Mağaza veritabanı boş</p>
                <p className="text-sm text-amber-600">Varsayılan kategorileri ve ürünleri yüklemek için butona tıklayın</p>
              </div>
            </div>
            <Button
              onClick={handleResetToDefaults}
              disabled={resetting}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {resetting ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Varsayılanları Yükle
                </>
              )}
            </Button>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeTab === 'categories' ? 'default' : 'outline'}
            onClick={() => setActiveTab('categories')}
            className="flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Kategoriler ({categories.length})
          </Button>
          <Button
            variant={activeTab === 'featured' ? 'default' : 'outline'}
            onClick={() => setActiveTab('featured')}
            className="flex items-center gap-2"
          >
            <Flame className="w-4 h-4" />
            Editörün Seçimi ({featured.length})
          </Button>

          {/* Reset to Defaults Button - Always visible */}
          {storeStatus.has_data && (
            <Button
              variant="outline"
              onClick={handleResetToDefaults}
              disabled={resetting}
              className="ml-auto flex items-center gap-2 text-amber-600 border-amber-300 hover:bg-amber-50"
            >
              {resetting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Varsayılana Dön
            </Button>
          )}
        </div>

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-4">
            {/* Add Category Button */}
            <Button
              onClick={() => setEditingCategory({ ...newCategoryTemplate })}
              className="w-full sm:w-auto flex items-center gap-2 bg-gradient-to-r from-violet-500 to-purple-600"
            >
              <Plus className="w-4 h-4" />
              Yeni Kategori Ekle
            </Button>

            {/* Category Editor Modal */}
            {editingCategory && (
              <CategoryEditor
                category={editingCategory}
                onSave={handleSaveCategory}
                onCancel={() => setEditingCategory(null)}
                saving={saving}
              />
            )}

            {/* Categories List */}
            <div className="space-y-3">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  expanded={expandedCategories[category.id]}
                  onToggleExpand={() => toggleExpand(category.id)}
                  onEdit={() => setEditingCategory(category)}
                  onDelete={() => handleDeleteCategory(category.id)}
                  createAmazonLink={createAmazonLink}
                />
              ))}

              {categories.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Henüz kategori eklenmemiş</p>
                  <p className="text-sm text-slate-400 mt-1">Yukarıdaki butona tıklayarak kategori ekleyin</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Featured Tab */}
        {activeTab === 'featured' && (
          <div className="space-y-4">
            {/* Add Featured Button */}
            <Button
              onClick={() => setEditingFeatured({ ...newFeaturedTemplate })}
              className="w-full sm:w-auto flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600"
            >
              <Plus className="w-4 h-4" />
              Yeni Öne Çıkan Ekle
            </Button>

            {/* Featured Editor Modal */}
            {editingFeatured && (
              <FeaturedEditor
                item={editingFeatured}
                onSave={handleSaveFeatured}
                onCancel={() => setEditingFeatured(null)}
                saving={saving}
              />
            )}

            {/* Featured List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featured.map((item) => (
                <FeaturedCard
                  key={item.id}
                  item={item}
                  onEdit={() => setEditingFeatured(item)}
                  onDelete={() => handleDeleteFeatured(item.id)}
                  createAmazonLink={createAmazonLink}
                />
              ))}

              {featured.length === 0 && (
                <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                  <Flame className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">Henüz öne çıkan ürün eklenmemiş</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Category Card Component
function CategoryCard({ category, expanded, onToggleExpand, onEdit, onDelete, createAmazonLink }) {
  const IconComponent = ICON_OPTIONS[category.icon] || BookOpen;

  return (
    <div className={`bg-white rounded-xl border ${category.isActive ? 'border-slate-200' : 'border-slate-300 opacity-60'} overflow-hidden`}>
      <div className="p-4 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center flex-shrink-0`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800">{category.title}</h3>
            {!category.isActive && (
              <span className="text-xs px-2 py-0.5 bg-slate-200 text-slate-600 rounded">Pasif</span>
            )}
          </div>
          <p className="text-sm text-slate-500 truncate">{category.description}</p>
          <p className="text-xs text-slate-400 mt-1">{category.products?.length || 0} ürün</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onToggleExpand}>
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={onEdit}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Expanded Products */}
      {expanded && category.products && category.products.length > 0 && (
        <div className="border-t border-slate-100 p-4 bg-slate-50">
          <div className="space-y-2">
            {category.products.map((product, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg">
                <div className="flex items-center gap-2">
                  {product.highlight && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
                  <span className="text-sm text-slate-700">{product.name}</span>
                </div>
                <a
                  href={createAmazonLink(product.query)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1"
                >
                  Test Et <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Featured Card Component
function FeaturedCard({ item, onEdit, onDelete, createAmazonLink }) {
  return (
    <div className={`bg-white rounded-xl border ${item.isActive ? 'border-slate-200' : 'border-slate-300 opacity-60'} p-4 relative`}>
      <div className="absolute top-3 right-3">
        <span className={`text-xs font-bold px-2 py-1 rounded-full bg-gradient-to-r ${item.gradient} text-white`}>
          {item.badge}
        </span>
      </div>

      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-3`}>
        <Star className="w-5 h-5 text-white" />
      </div>

      <h3 className="font-bold text-slate-800 mb-1 pr-16 line-clamp-2">{item.title}</h3>
      <p className="text-sm text-slate-500 mb-3 line-clamp-2">{item.description}</p>

      <div className="flex items-center justify-between">
        <a
          href={createAmazonLink(item.query)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-violet-600 hover:text-violet-700 flex items-center gap-1"
        >
          Test Et <ExternalLink className="w-3 h-3" />
        </a>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={onDelete}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Category Editor Modal
function CategoryEditor({ category, onSave, onCancel, saving }) {
  const [data, setData] = useState({ ...category });
  const [newProduct, setNewProduct] = useState({ name: '', query: '', highlight: false });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.query) return;
    setData(prev => ({
      ...prev,
      products: [...(prev.products || []), { ...newProduct }]
    }));
    setNewProduct({ name: '', query: '', highlight: false });
  };

  const handleRemoveProduct = (idx) => {
    setData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== idx)
    }));
  };

  const handleProductChange = (idx, field, value) => {
    setData(prev => ({
      ...prev,
      products: prev.products.map((p, i) => i === idx ? { ...p, [field]: value } : p)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{category.id ? 'Kategori Düzenle' : 'Yeni Kategori'}</h2>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Başlık</label>
              <Input
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                placeholder="Kategori başlığı"
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-1 block">Açıklama</label>
              <Textarea
                value={data.description}
                onChange={(e) => setData({ ...data, description: e.target.value })}
                placeholder="Kısa açıklama"
                rows={2}
              />
            </div>
          </div>

          {/* Icon & Gradient */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">İkon</label>
              <select
                value={data.icon}
                onChange={(e) => setData({ ...data, icon: e.target.value })}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg"
              >
                {Object.keys(ICON_OPTIONS).map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Renk</label>
              <select
                value={data.gradient}
                onChange={(e) => setData({ ...data, gradient: e.target.value })}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg"
              >
                {GRADIENT_OPTIONS.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={data.isActive}
              onChange={(e) => setData({ ...data, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="isActive" className="text-sm text-slate-700">Aktif (Mağazada görünsün)</label>
          </div>

          {/* Products */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="font-medium text-slate-800 mb-3">Ürünler ({data.products?.length || 0})</h3>
            
            {/* Add Product */}
            <div className="bg-slate-50 rounded-lg p-3 mb-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Input
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  placeholder="Ürün adı"
                />
                <Input
                  value={newProduct.query}
                  onChange={(e) => setNewProduct({ ...newProduct, query: e.target.value })}
                  placeholder="Arama sorgusu"
                />
                <div className="flex gap-2">
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="checkbox"
                      checked={newProduct.highlight}
                      onChange={(e) => setNewProduct({ ...newProduct, highlight: e.target.checked })}
                    />
                    Öne Çıkar
                  </label>
                  <Button onClick={handleAddProduct} size="sm" className="ml-auto">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Product List */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.products?.map((product, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg">
                  <Input
                    value={product.name}
                    onChange={(e) => handleProductChange(idx, 'name', e.target.value)}
                    className="flex-1 h-8 text-sm"
                  />
                  <Input
                    value={product.query}
                    onChange={(e) => handleProductChange(idx, 'query', e.target.value)}
                    className="flex-1 h-8 text-sm"
                  />
                  <label className="flex items-center gap-1 text-xs whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={product.highlight}
                      onChange={(e) => handleProductChange(idx, 'highlight', e.target.checked)}
                    />
                    Öne
                  </label>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleRemoveProduct(idx)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>İptal</Button>
          <Button onClick={() => onSave(data)} disabled={saving || !data.title}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Featured Editor Modal
function FeaturedEditor({ item, onSave, onCancel, saving }) {
  const [data, setData] = useState({ ...item });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">{item.id ? 'Öne Çıkan Düzenle' : 'Yeni Öne Çıkan'}</h2>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Başlık</label>
            <Input
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              placeholder="Ürün başlığı"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Açıklama</label>
            <Textarea
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              placeholder="Kısa açıklama"
              rows={2}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Amazon Arama Sorgusu</label>
            <Input
              value={data.query}
              onChange={(e) => setData({ ...data, query: e.target.value })}
              placeholder="örn: çocuk masal kitabı"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Rozet</label>
              <select
                value={data.badge}
                onChange={(e) => setData({ ...data, badge: e.target.value })}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg"
              >
                {BADGE_OPTIONS.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Renk</label>
              <select
                value={data.gradient}
                onChange={(e) => setData({ ...data, gradient: e.target.value })}
                className="w-full h-10 px-3 border border-slate-200 rounded-lg"
              >
                {GRADIENT_OPTIONS.map(g => (
                  <option key={g.value} value={g.value}>{g.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featuredActive"
              checked={data.isActive}
              onChange={(e) => setData({ ...data, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="featuredActive" className="text-sm text-slate-700">Aktif</label>
          </div>
        </div>

        <div className="border-t border-slate-200 px-6 py-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>İptal</Button>
          <Button onClick={() => onSave(data)} disabled={saving || !data.title || !data.query}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>
    </div>
  );
}
