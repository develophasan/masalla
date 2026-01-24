# 🚀 MASAL SEPETİ - Flutter API Kullanım Rehberi

## 📌 ÖNEMLİ: Base URL ve Yapılandırma

```dart
// ✅ DOĞRU BASE URL
const String BASE_URL = "https://masal.space/api";

// ❌ YANLIŞ - HTML döndürür
// const String BASE_URL = "https://masal.space";
```

> **⚠️ DİKKAT:** Tüm API endpoint'leri `/api` prefix'i ile başlamalıdır!

---

## 🔧 Flutter HTTP Client Yapılandırması

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = "https://masal.space/api";
  String? _sessionToken;

  // Token'ı SharedPreferences'tan yükle
  Future<void> loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _sessionToken = prefs.getString('session_token');
  }

  // Token'ı kaydet
  Future<void> saveToken(String token) async {
    _sessionToken = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('session_token', token);
  }

  // Token'ı sil (logout)
  Future<void> clearToken() async {
    _sessionToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('session_token');
  }

  // Ortak headers
  Map<String, String> get headers {
    final h = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (_sessionToken != null) {
      h['Authorization'] = 'Bearer $_sessionToken';
    }
    return h;
  }
}
```

---

## 🔐 1. KİMLİK DOĞRULAMA (Authentication)

### 1.1 Kullanıcı Kaydı (Register)

```dart
Future<Map<String, dynamic>> register({
  required String name,
  required String surname,
  required String email,
  required String phone,
  required String password,
}) async {
  final response = await http.post(
    Uri.parse('$baseUrl/auth/register'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'name': name,
      'surname': surname,
      'email': email,
      'phone': phone,
      'password': password,
    }),
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception(jsonDecode(response.body)['detail'] ?? 'Kayıt hatası');
  }
}
```

**İstek:**
```json
POST https://masal.space/api/auth/register
Content-Type: application/json

{
  "name": "Ali",
  "surname": "Yılmaz",
  "email": "ali@example.com",
  "phone": "5551234567",
  "password": "sifre123"
}
```

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "message": "Kayıt başarılı! Email adresinizi doğrulayın.",
  "user": {
    "user_id": "user_abc123def456",
    "name": "Ali",
    "surname": "Yılmaz",
    "email": "ali@example.com",
    "phone": "5551234567",
    "credits": 10,
    "role": "user",
    "is_verified": false
  }
}
```

---

### 1.2 Giriş (Login) - ⭐ SESSION TOKEN ALMA

```dart
Future<Map<String, dynamic>> login({
  required String email,
  required String password,
}) async {
  final response = await http.post(
    Uri.parse('$baseUrl/auth/login'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'email': email,
      'password': password,
    }),
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    
    // ⭐ SESSION TOKEN'I KAYDET
    if (data['session_token'] != null) {
      await saveToken(data['session_token']);
    }
    
    return data;
  } else {
    throw Exception(jsonDecode(response.body)['detail'] ?? 'Giriş hatası');
  }
}
```

**İstek:**
```json
POST https://masal.space/api/auth/login
Content-Type: application/json

{
  "email": "ali@example.com",
  "password": "sifre123"
}
```

**Başarılı Yanıt (200):**
```json
{
  "success": true,
  "user": {
    "user_id": "user_abc123def456",
    "name": "Ali",
    "surname": "Yılmaz",
    "email": "ali@example.com",
    "credits": 10,
    "role": "user"
  },
  "session_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

> **⭐ ÖNEMLİ:** `session_token` değerini güvenli bir şekilde saklayın (EncryptedSharedPreferences önerilir) ve korumalı endpoint'lerde kullanın.

---

### 1.3 Mevcut Kullanıcı Bilgisi

```dart
Future<Map<String, dynamic>> getCurrentUser() async {
  final response = await http.get(
    Uri.parse('$baseUrl/auth/me'),
    headers: headers, // Authorization header içerir
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else if (response.statusCode == 401) {
    throw Exception('Giriş yapmanız gerekiyor');
  } else {
    throw Exception('Kullanıcı bilgisi alınamadı');
  }
}
```

**İstek:**
```
GET https://masal.space/api/auth/me
Authorization: Bearer YOUR_SESSION_TOKEN
```

---

### 1.4 Çıkış (Logout)

```dart
Future<void> logout() async {
  await http.post(
    Uri.parse('$baseUrl/auth/logout'),
    headers: headers,
  );
  await clearToken();
}
```

---

## 📚 2. KONULAR (Topics)

### 2.1 Tüm Konuları Listele

```dart
Future<List<dynamic>> getTopics() async {
  final response = await http.get(
    Uri.parse('$baseUrl/topics'),
    headers: {'Accept': 'application/json'},
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Konular yüklenemedi');
  }
}
```

**İstek:**
```
GET https://masal.space/api/topics
```

**Yanıt:**
```json
[
  {
    "id": "deger-egitimi",
    "name": "Değer Eğitimi",
    "icon": "❤️",
    "color": "#FF6B6B",
    "description": "Temel değerleri öğreten masallar",
    "image": "https://...",
    "subtopic_count": 8
  },
  {
    "id": "bilim-doga",
    "name": "Bilim ve Doğa",
    "icon": "🔬",
    "color": "#4ECDC4",
    "description": "Bilimsel kavramları anlatan masallar",
    "image": "https://...",
    "subtopic_count": 6
  }
]
```

---

### 2.2 Konu Detayı ve Alt Konular

```dart
Future<Map<String, dynamic>> getTopicDetail(String topicId) async {
  final response = await http.get(
    Uri.parse('$baseUrl/topics/$topicId'),
    headers: {'Accept': 'application/json'},
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Konu bulunamadı');
  }
}
```

**İstek:**
```
GET https://masal.space/api/topics/deger-egitimi
```

**Yanıt:**
```json
{
  "id": "deger-egitimi",
  "name": "Değer Eğitimi",
  "icon": "❤️",
  "color": "#FF6B6B",
  "description": "Temel değerleri öğreten masallar",
  "image": "https://...",
  "subtopics": [
    {
      "id": "deger-paylasim",
      "name": "Paylaşım",
      "kazanim": "Paylaşmanın önemini kavrar"
    },
    {
      "id": "deger-saygi",
      "name": "Saygı",
      "kazanim": "Büyüklerine ve çevresine saygılı olur"
    }
  ]
}
```

---

## 📖 3. MASALLAR (Stories)

### 3.1 Masalları Listele

```dart
Future<List<dynamic>> getStories({
  String? topicId,
  String? subtopicId,
  String? search,
  String sortBy = 'popular', // popular, newest, oldest
  int limit = 20,
}) async {
  final queryParams = <String, String>{
    'limit': limit.toString(),
  };
  
  if (topicId != null) queryParams['topic_id'] = topicId;
  if (subtopicId != null) queryParams['subtopic_id'] = subtopicId;
  if (search != null) queryParams['search'] = search;
  if (sortBy != null) queryParams['sort_by'] = sortBy;

  final uri = Uri.parse('$baseUrl/stories').replace(queryParameters: queryParams);
  
  final response = await http.get(
    uri,
    headers: {'Accept': 'application/json'},
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Masallar yüklenemedi');
  }
}
```

**İstek Örnekleri:**
```
# Tüm masallar (popülerlik sırasına göre)
GET https://masal.space/api/stories

# Konuya göre filtreleme
GET https://masal.space/api/stories?topic_id=deger-egitimi

# Arama
GET https://masal.space/api/stories?search=tavşan

# En yeniler
GET https://masal.space/api/stories?sort_by=newest&limit=10
```

**Yanıt:**
```json
[
  {
    "id": "story-uuid-123",
    "slug": "cesur-tavsan-macerasi",
    "title": "Cesur Tavşan'ın Macerası",
    "content": "Bir varmış bir yokmuş...",
    "topic_id": "deger-egitimi",
    "topic_name": "Değer Eğitimi",
    "subtopic_name": "Cesaret",
    "theme": "macera",
    "age_group": "4-6",
    "character": "tavşan",
    "audio_base64": "base64_encoded_mp3...",
    "duration": 180,
    "play_count": 42,
    "created_at": "2025-01-20T10:30:00Z",
    "creator_name": "Ali Yılmaz",
    "creator_id": "user_abc123",
    "creator_picture": "https://..."
  }
]
```

---

### 3.2 Popüler Masallar

```dart
Future<List<dynamic>> getPopularStories({int limit = 6}) async {
  final response = await http.get(
    Uri.parse('$baseUrl/stories/popular?limit=$limit'),
    headers: {'Accept': 'application/json'},
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Popüler masallar yüklenemedi');
  }
}
```

---

### 3.3 Masal Detayı (Slug ile - SEO URL)

```dart
Future<Map<String, dynamic>> getStoryBySlug(String slug) async {
  final response = await http.get(
    Uri.parse('$baseUrl/masal/$slug'),
    headers: {'Accept': 'application/json'},
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else if (response.statusCode == 404) {
    throw Exception('Masal bulunamadı');
  } else {
    throw Exception('Masal yüklenemedi');
  }
}
```

**İstek:**
```
GET https://masal.space/api/masal/cesur-tavsan-macerasi
```

---

### 3.4 Masal Detayı (ID ile)

```dart
Future<Map<String, dynamic>> getStoryById(String storyId) async {
  final response = await http.get(
    Uri.parse('$baseUrl/stories/$storyId'),
    headers: {'Accept': 'application/json'},
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Masal bulunamadı');
  }
}
```

---

### 3.5 ⭐ Yeni Masal Oluştur (Auth Gerekli)

```dart
Future<Map<String, dynamic>> generateStory({
  required String topicId,
  String? subtopicId,
  required String theme,
  required String ageGroup, // "3-4", "4-6", "6-8"
  String? character,
  bool kazanimBased = false,
}) async {
  final response = await http.post(
    Uri.parse('$baseUrl/stories/generate'),
    headers: headers, // Authorization header içermeli!
    body: jsonEncode({
      'topic_id': topicId,
      'subtopic_id': subtopicId,
      'theme': theme,
      'age_group': ageGroup,
      'character': character,
      'kazanim_based': kazanimBased,
    }),
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else if (response.statusCode == 401) {
    throw Exception('Giriş yapmanız gerekiyor');
  } else if (response.statusCode == 402) {
    throw Exception('Krediniz bitti! Kredi talebi oluşturun.');
  } else {
    final error = jsonDecode(response.body);
    throw Exception(error['detail'] ?? 'Masal oluşturulamadı');
  }
}
```

**İstek:**
```json
POST https://masal.space/api/stories/generate
Authorization: Bearer YOUR_SESSION_TOKEN
Content-Type: application/json

{
  "topic_id": "deger-egitimi",
  "subtopic_id": "deger-cesaret",
  "theme": "orman macerası",
  "age_group": "4-6",
  "character": "küçük tavşan",
  "kazanim_based": true
}
```

**Başarılı Yanıt (200):**
```json
{
  "id": "new-story-uuid",
  "slug": "4-6-yas-cesur-tavsan",
  "title": "Cesur Tavşan'ın Orman Macerası",
  "content": "Bir varmış bir yokmuş, uzak bir ormanda...",
  "topic_id": "deger-egitimi",
  "topic_name": "Değer Eğitimi",
  "theme": "orman macerası",
  "age_group": "4-6",
  "audio_base64": "base64_encoded_mp3...",
  "duration": 195,
  "play_count": 0,
  "created_at": "2025-01-22T12:00:00Z"
}
```

---

### 3.6 Dinlenme Sayısını Artır

```dart
Future<void> incrementPlayCount(String storyId) async {
  await http.post(
    Uri.parse('$baseUrl/stories/$storyId/play'),
    headers: {'Accept': 'application/json'},
  );
}
```

---

## ❤️ 4. FAVORİLER (Auth Gerekli)

### 4.1 Favorileri Listele

```dart
Future<List<dynamic>> getFavorites() async {
  final response = await http.get(
    Uri.parse('$baseUrl/favorites'),
    headers: headers,
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Favoriler yüklenemedi');
  }
}
```

### 4.2 Favorilere Ekle

```dart
Future<void> addToFavorites(String storyId) async {
  final response = await http.post(
    Uri.parse('$baseUrl/favorites/$storyId'),
    headers: headers,
  );

  if (response.statusCode != 200) {
    throw Exception('Favorilere eklenemedi');
  }
}
```

### 4.3 Favorilerden Çıkar

```dart
Future<void> removeFromFavorites(String storyId) async {
  final response = await http.delete(
    Uri.parse('$baseUrl/favorites/$storyId'),
    headers: headers,
  );

  if (response.statusCode != 200) {
    throw Exception('Favorilerden çıkarılamadı');
  }
}
```

### 4.4 Favori Kontrolü

```dart
Future<bool> isFavorite(String storyId) async {
  final response = await http.get(
    Uri.parse('$baseUrl/favorites/check/$storyId'),
    headers: headers,
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return data['is_favorite'] ?? false;
  }
  return false;
}
```

---

## 💰 5. KREDİLER (Auth Gerekli)

### 5.1 Kredi Bakiyesi

```dart
Future<int> getCreditBalance() async {
  final response = await http.get(
    Uri.parse('$baseUrl/credits/balance'),
    headers: headers,
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    return data['credits'] ?? 0;
  } else {
    throw Exception('Bakiye alınamadı');
  }
}
```

### 5.2 Kredi Talebi Oluştur

```dart
Future<void> requestCredits({
  int requestedCredits = 10,
  String? message,
}) async {
  final response = await http.post(
    Uri.parse('$baseUrl/credits/request'),
    headers: headers,
    body: jsonEncode({
      'requested_credits': requestedCredits,
      'message': message,
    }),
  );

  if (response.statusCode != 200) {
    throw Exception('Kredi talebi oluşturulamadı');
  }
}
```

---

## 👤 6. KULLANICI PROFİLİ (Auth Gerekli)

### 6.1 Profil Bilgisi

```dart
Future<Map<String, dynamic>> getProfile() async {
  final response = await http.get(
    Uri.parse('$baseUrl/users/profile'),
    headers: headers,
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Profil yüklenemedi');
  }
}
```

### 6.2 Profil Güncelle

```dart
Future<void> updateProfile({
  String? name,
  String? surname,
  String? phone,
}) async {
  final response = await http.put(
    Uri.parse('$baseUrl/users/profile'),
    headers: headers,
    body: jsonEncode({
      if (name != null) 'name': name,
      if (surname != null) 'surname': surname,
      if (phone != null) 'phone': phone,
    }),
  );

  if (response.statusCode != 200) {
    throw Exception('Profil güncellenemedi');
  }
}
```

### 6.3 Kullanıcının Masalları

```dart
Future<List<dynamic>> getMyStories({int skip = 0, int limit = 20}) async {
  final response = await http.get(
    Uri.parse('$baseUrl/users/stories?skip=$skip&limit=$limit'),
    headers: headers,
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Masallar yüklenemedi');
  }
}
```

---

## 🔊 7. SES OYNATMA (Audio)

```dart
import 'dart:convert';
import 'dart:io';
import 'package:audioplayers/audioplayers.dart';
import 'package:path_provider/path_provider.dart';

class AudioPlayerService {
  final AudioPlayer _player = AudioPlayer();

  Future<void> playStoryAudio(String base64Audio) async {
    try {
      // Base64'ü decode et
      final bytes = base64Decode(base64Audio);
      
      // Geçici dosyaya yaz
      final tempDir = await getTemporaryDirectory();
      final tempFile = File('${tempDir.path}/story_audio.mp3');
      await tempFile.writeAsBytes(bytes);
      
      // Oynat
      await _player.play(DeviceFileSource(tempFile.path));
    } catch (e) {
      print('Ses oynatma hatası: $e');
    }
  }

  Future<void> pause() async {
    await _player.pause();
  }

  Future<void> resume() async {
    await _player.resume();
  }

  Future<void> stop() async {
    await _player.stop();
  }

  void dispose() {
    _player.dispose();
  }
}
```

---

## ⚠️ HATA KODLARI

| Kod | Açıklama |
|-----|----------|
| 200 | Başarılı |
| 400 | Geçersiz istek (eksik/hatalı parametre) |
| 401 | Yetkilendirme gerekli (token yok/geçersiz) |
| 402 | Kredi yetersiz |
| 403 | Yetki yok (başkasının kaynağına erişim) |
| 404 | Kaynak bulunamadı |
| 500 | Sunucu hatası |

---

## 🧪 TEST CURL KOMUTLARI

```bash
# Health check
curl https://masal.space/api/health

# Konuları listele
curl https://masal.space/api/topics

# Masalları listele
curl https://masal.space/api/stories?limit=5

# Giriş yap ve token al
curl -X POST https://masal.space/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'

# Token ile profil al
curl https://masal.space/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 📱 TAM Flutter ApiService Sınıfı

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class MasalApiService {
  static const String baseUrl = "https://masal.space/api";
  String? _sessionToken;

  // Singleton pattern
  static final MasalApiService _instance = MasalApiService._internal();
  factory MasalApiService() => _instance;
  MasalApiService._internal();

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _sessionToken = prefs.getString('session_token');
  }

  Future<void> _saveToken(String token) async {
    _sessionToken = token;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('session_token', token);
  }

  Future<void> _clearToken() async {
    _sessionToken = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('session_token');
  }

  Map<String, String> get _headers {
    final h = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (_sessionToken != null) {
      h['Authorization'] = 'Bearer $_sessionToken';
    }
    return h;
  }

  bool get isLoggedIn => _sessionToken != null;

  // ========== AUTH ==========
  
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      if (data['session_token'] != null) {
        await _saveToken(data['session_token']);
      }
      return data;
    }
    throw Exception(jsonDecode(response.body)['detail'] ?? 'Giriş hatası');
  }

  Future<void> logout() async {
    try {
      await http.post(Uri.parse('$baseUrl/auth/logout'), headers: _headers);
    } finally {
      await _clearToken();
    }
  }

  Future<Map<String, dynamic>?> getCurrentUser() async {
    if (_sessionToken == null) return null;
    
    final response = await http.get(
      Uri.parse('$baseUrl/auth/me'),
      headers: _headers,
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return null;
  }

  // ========== TOPICS ==========

  Future<List<dynamic>> getTopics() async {
    final response = await http.get(Uri.parse('$baseUrl/topics'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Konular yüklenemedi');
  }

  Future<Map<String, dynamic>> getTopicDetail(String topicId) async {
    final response = await http.get(Uri.parse('$baseUrl/topics/$topicId'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Konu bulunamadı');
  }

  // ========== STORIES ==========

  Future<List<dynamic>> getStories({
    String? topicId,
    String? search,
    String sortBy = 'popular',
    int limit = 20,
  }) async {
    final params = <String, String>{'limit': '$limit', 'sort_by': sortBy};
    if (topicId != null) params['topic_id'] = topicId;
    if (search != null) params['search'] = search;

    final uri = Uri.parse('$baseUrl/stories').replace(queryParameters: params);
    final response = await http.get(uri);
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Masallar yüklenemedi');
  }

  Future<List<dynamic>> getPopularStories({int limit = 6}) async {
    final response = await http.get(
      Uri.parse('$baseUrl/stories/popular?limit=$limit'),
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Popüler masallar yüklenemedi');
  }

  Future<Map<String, dynamic>> getStoryBySlug(String slug) async {
    final response = await http.get(Uri.parse('$baseUrl/masal/$slug'));
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Masal bulunamadı');
  }

  Future<Map<String, dynamic>> generateStory({
    required String topicId,
    required String theme,
    required String ageGroup,
    String? subtopicId,
    String? character,
  }) async {
    final response = await http.post(
      Uri.parse('$baseUrl/stories/generate'),
      headers: _headers,
      body: jsonEncode({
        'topic_id': topicId,
        'subtopic_id': subtopicId,
        'theme': theme,
        'age_group': ageGroup,
        'character': character,
        'kazanim_based': subtopicId != null,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else if (response.statusCode == 401) {
      throw Exception('Giriş yapmanız gerekiyor');
    } else if (response.statusCode == 402) {
      throw Exception('Krediniz bitti!');
    }
    throw Exception(jsonDecode(response.body)['detail'] ?? 'Masal oluşturulamadı');
  }

  // ========== FAVORITES ==========

  Future<List<dynamic>> getFavorites() async {
    final response = await http.get(
      Uri.parse('$baseUrl/favorites'),
      headers: _headers,
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    return [];
  }

  Future<void> toggleFavorite(String storyId, bool isFavorite) async {
    if (isFavorite) {
      await http.delete(
        Uri.parse('$baseUrl/favorites/$storyId'),
        headers: _headers,
      );
    } else {
      await http.post(
        Uri.parse('$baseUrl/favorites/$storyId'),
        headers: _headers,
      );
    }
  }

  // ========== CREDITS ==========

  Future<int> getCreditBalance() async {
    final response = await http.get(
      Uri.parse('$baseUrl/credits/balance'),
      headers: _headers,
    );
    if (response.statusCode == 200) {
      return jsonDecode(response.body)['credits'] ?? 0;
    }
    return 0;
  }
}
```

---

## ✅ KONTROL LİSTESİ

- [ ] Base URL: `https://masal.space/api` (sonunda `/api` var mı?)
- [ ] Content-Type: `application/json` header'ı eklendi mi?
- [ ] Korumalı endpoint'lerde `Authorization: Bearer TOKEN` header'ı var mı?
- [ ] Token login sonrası kaydediliyor mu?
- [ ] HTTP yanıt kodları kontrol ediliyor mu?
- [ ] JSON parse hataları handle ediliyor mu?

---

**Son Güncelleme:** 22 Ocak 2025
