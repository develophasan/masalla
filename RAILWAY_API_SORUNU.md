# 🚨 RAILWAY DEPLOYMENT - API ÇALIŞMIYOR SORUNU

## Problem
`https://masal.space/api/*` endpoint'leri HTML döndürüyor çünkü Railway'de backend ve frontend ayrı servisler olarak deploy ediliyor ve `masal.space` sadece frontend'e yönlendirilmiş.

## Çözüm Seçenekleri

### Seçenek 1: Backend için Subdomain (ÖNERİLEN)
1. Railway Dashboard'a git
2. Backend servisine tıkla
3. **Settings** > **Networking** > **Public Networking**
4. Custom domain ekle: `api.masal.space`
5. DNS'te CNAME kaydı oluştur:
   - Host: `api`
   - Value: `masalla-production.up.railway.app` (veya Railway'in verdiği domain)

**Flutter'da kullanım:**
```dart
const String BASE_URL = "https://api.masal.space/api";
```

### Seçenek 2: Railway Domain'i Kullan
Backend'in otomatik Railway domain'ini kullan:

1. Railway Dashboard > Backend Service > Settings
2. **Networking** bölümünde "Public Domain" aç
3. Otomatik oluşan URL'yi kopyala (örn: `masalla-backend-production.up.railway.app`)

**Flutter'da kullanım:**
```dart
const String BASE_URL = "https://masalla-backend-production.up.railway.app/api";
```

## Kontrol Adımları

1. Railway Dashboard'da backend servisinin **Deploy Logs**'unu kontrol et
2. Backend başarıyla başlatıldı mı?
3. Public domain aktif mi?

## Test Komutları

```bash
# Backend'in Railway URL'si ile test et
curl https://YOUR-BACKEND-URL.up.railway.app/api/health

# Konuları test et
curl https://YOUR-BACKEND-URL.up.railway.app/api/topics
```

## Flutter Güncelleme

Backend URL'sini bulduktan sonra:

```dart
class MasalApiService {
  // ÖNEMLİ: Backend'in gerçek URL'sini kullanın
  static const String baseUrl = "https://YOUR-BACKEND-URL.up.railway.app/api";
  // VEYA subdomain kullanıyorsanız:
  // static const String baseUrl = "https://api.masal.space/api";
}
```

## Mevcut Durum

- Frontend: `https://masal.space` ✅ Çalışıyor
- Backend API: ❌ Public URL yok veya yanlış yapılandırılmış

---

**Lütfen Railway Dashboard'dan backend servisinin public URL'sini kontrol edin ve bana bildirin.**
