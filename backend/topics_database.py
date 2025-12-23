"""
MASAL SEPETİ - Konu Havuzu ve Kazanım Veritabanı
Zengin konu listesi ve pedagojik kazanımlar
"""

TOPICS_DATABASE = {
    "vucudumuz": {
        "id": "vucudumuz",
        "name": "Vücudumuzu Tanıyalım",
        "icon": "heart",
        "color": "rose",
        "description": "Organlarımız ve sağlıklı yaşam",
        "image": "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400",
        "subtopics": [
            {"id": "organlar", "name": "Organlarımız", "kazanim": "Vücudundaki temel organları tanır ve görevlerini basit düzeyde açıklar."},
            {"id": "kalp", "name": "Kalbim nasıl çalışır?", "kazanim": "Kalbin vücuttaki görevini ve önemini fark eder."},
            {"id": "akciger", "name": "Akciğerler ve nefes alma", "kazanim": "Nefes almanın yaşamsal önemini kavrar."},
            {"id": "beyin", "name": "Beynim ve düşünme", "kazanim": "Beynin düşünme ve öğrenmedeki rolünü fark eder."},
            {"id": "duyular", "name": "Duyularımız", "kazanim": "Beş duyu organını ayırt eder ve günlük yaşamda kullanımını fark eder."},
            {"id": "dis", "name": "Diş sağlığı", "kazanim": "Diş sağlığını korumaya yönelik alışkanlıklar geliştirir."},
            {"id": "kemik", "name": "Kemiklerimiz ve kaslarımız", "kazanim": "İskelet ve kasların hareket için önemini kavrar."},
            {"id": "beslenme", "name": "Sağlıklı beslenme", "kazanim": "Sağlıklı ve sağlıksız besinleri ayırt eder."},
            {"id": "temizlik", "name": "Temizlik ve hijyen", "kazanim": "Kişisel temizliğin sağlık için önemini fark eder."},
            {"id": "uyku", "name": "Uyku ve dinlenme", "kazanim": "Yeterli uykunun sağlık için önemini kavrar."}
        ]
    },
    "doga": {
        "id": "doga",
        "name": "Doğa ve Çevre",
        "icon": "leaf",
        "color": "emerald",
        "description": "Doğayı tanıyalım ve koruyalım",
        "image": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400",
        "subtopics": [
            {"id": "koruma", "name": "Doğayı koruyalım", "kazanim": "Doğayı korumaya yönelik sorumluluk geliştirir."},
            {"id": "geridonusum", "name": "Geri dönüşüm", "kazanim": "Atıkların ayrıştırılmasının çevreye katkısını fark eder."},
            {"id": "agaclar", "name": "Ağaçlar ve ormanlar", "kazanim": "Ağaçların canlılar için önemini kavrar."},
            {"id": "su", "name": "Su tasarrufu", "kazanim": "Suyun bilinçli kullanımının önemini kavrar."},
            {"id": "mevsimler", "name": "Mevsimler", "kazanim": "Mevsimlerin temel özelliklerini ayırt eder."},
            {"id": "hava", "name": "Hava olayları", "kazanim": "Farklı hava olaylarını tanır ve etkilerini fark eder."},
            {"id": "toprak", "name": "Toprak ve bitkiler", "kazanim": "Bitkilerin büyüme sürecini fark eder."},
            {"id": "canlilar", "name": "Doğadaki canlılar", "kazanim": "Doğadaki canlı çeşitliliğini fark eder."},
            {"id": "cevre_temizlik", "name": "Çevre temizliği", "kazanim": "Çevreyi temiz tutmanın önemini kavrar."},
            {"id": "iklim", "name": "İklim ve doğa dengesi", "kazanim": "İklim değişikliğinin doğa üzerindeki etkilerini fark eder."}
        ]
    },
    "hayvanlar": {
        "id": "hayvanlar",
        "name": "Hayvanlar Dünyası",
        "icon": "cat",
        "color": "amber",
        "description": "Hayvanları tanıyalım ve sevelim",
        "image": "https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=400",
        "subtopics": [
            {"id": "evcil", "name": "Evcil hayvanlar", "kazanim": "Evcil hayvanların bakım ihtiyaçlarını fark eder."},
            {"id": "vahsi", "name": "Vahşi hayvanlar", "kazanim": "Vahşi hayvanların yaşam alanlarını tanır."},
            {"id": "deniz", "name": "Deniz canlıları", "kazanim": "Deniz canlılarının çeşitliliğini fark eder."},
            {"id": "orman", "name": "Orman hayvanları", "kazanim": "Orman ekosisteminde yaşayan hayvanları tanır."},
            {"id": "ciftlik", "name": "Çiftlik hayvanları", "kazanim": "Çiftlik hayvanlarının insanlara faydalarını kavrar."},
            {"id": "yuvalar", "name": "Hayvanların yuvaları", "kazanim": "Farklı hayvanların barınma şekillerini öğrenir."},
            {"id": "beslenmesi", "name": "Hayvanların beslenmesi", "kazanim": "Hayvanların farklı beslenme şekillerini fark eder."},
            {"id": "sevgi", "name": "Hayvan sevgisi", "kazanim": "Hayvanlara karşı sevgi ve saygı geliştirir."},
            {"id": "nesli", "name": "Nesli tükenen hayvanlar", "kazanim": "Nesli tehlike altındaki hayvanları koruma bilinci geliştirir."},
            {"id": "insan", "name": "Hayvanlar ve insanlar", "kazanim": "İnsan-hayvan ilişkisinin önemini kavrar."}
        ]
    },
    "degerler": {
        "id": "degerler",
        "name": "Değerler Eğitimi",
        "icon": "star",
        "color": "violet",
        "description": "İyi insan olmanın temelleri",
        "image": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400",
        "subtopics": [
            {"id": "paylasma", "name": "Paylaşmak", "kazanim": "Paylaşmanın sosyal ilişkileri güçlendirdiğini fark eder."},
            {"id": "yardim", "name": "Yardımlaşma", "kazanim": "İş birliği ve yardımlaşmanın önemini kavrar."},
            {"id": "durustluk", "name": "Dürüstlük", "kazanim": "Doğruyu söylemenin önemini fark eder."},
            {"id": "saygi", "name": "Saygı", "kazanim": "Kendisine ve başkalarına saygılı davranır."},
            {"id": "sevgi", "name": "Sevgi", "kazanim": "Sevginin ilişkilerdeki önemini kavrar."},
            {"id": "sorumluluk", "name": "Sorumluluk", "kazanim": "Üzerine düşen görevleri yerine getirme bilinci geliştirir."},
            {"id": "sabir", "name": "Sabır", "kazanim": "Sabırlı olmanın önemini fark eder."},
            {"id": "empati", "name": "Empati", "kazanim": "Başkalarının duygularını anlamaya çalışır."},
            {"id": "hosgoru", "name": "Hoşgörü", "kazanim": "Farklılıklara karşı hoşgörülü olmayı öğrenir."},
            {"id": "adalet", "name": "Adalet", "kazanim": "Adil davranmanın önemini kavrar."}
        ]
    },
    "duygular": {
        "id": "duygular",
        "name": "Duygularımız",
        "icon": "smile",
        "color": "pink",
        "description": "Duygularımızı tanıyalım ve ifade edelim",
        "image": "https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=400",
        "subtopics": [
            {"id": "mutluluk", "name": "Mutluluk", "kazanim": "Duygularını tanır ve ifade eder."},
            {"id": "uzuntu", "name": "Üzüntü", "kazanim": "Üzüntü duygusunu sağlıklı şekilde ifade etmeyi öğrenir."},
            {"id": "korku", "name": "Korku", "kazanim": "Korku duygusunun doğal olduğunu fark eder."},
            {"id": "ofke", "name": "Öfke ve sakinleşme", "kazanim": "Öfke duygusunu uygun yollarla kontrol etmeyi öğrenir."},
            {"id": "kiskanclik", "name": "Kıskançlık", "kazanim": "Kıskançlık duygusunu tanır ve yönetmeyi öğrenir."},
            {"id": "heyecan", "name": "Heyecan", "kazanim": "Heyecan duygusunu olumlu şekilde yaşamayı öğrenir."},
            {"id": "cesaret", "name": "Cesaret", "kazanim": "Cesur olmanın önemini kavrar."},
            {"id": "utangaclik", "name": "Utangaçlık", "kazanim": "Utangaçlıkla başa çıkma yollarını öğrenir."},
            {"id": "ozguven", "name": "Öz güven", "kazanim": "Kendine güven duygusu geliştirir."},
            {"id": "ifade", "name": "Duygularımı ifade ediyorum", "kazanim": "Duygularını uygun şekilde ifade etmeyi öğrenir."}
        ]
    },
    "okul": {
        "id": "okul",
        "name": "Okul ve Sosyal Yaşam",
        "icon": "school",
        "color": "sky",
        "description": "Okul hayatı ve arkadaşlık",
        "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400",
        "subtopics": [
            {"id": "baslama", "name": "Okula başlama", "kazanim": "Okul ortamına uyum sağlar."},
            {"id": "ogretmen", "name": "Öğretmen sevgisi", "kazanim": "Öğretmenine saygı ve sevgi duyar."},
            {"id": "arkadaslik", "name": "Arkadaşlık", "kazanim": "Sağlıklı arkadaşlık ilişkileri kurar."},
            {"id": "kurallar", "name": "Sınıf kuralları", "kazanim": "Toplumsal yaşamda kuralların gerekliliğini fark eder."},
            {"id": "sira", "name": "Sıra bekleme", "kazanim": "Sabır ve öz denetim geliştirir."},
            {"id": "oynama", "name": "Paylaşarak oynamak", "kazanim": "Oyunlarda paylaşmanın önemini kavrar."},
            {"id": "grup", "name": "Grup çalışması", "kazanim": "Grup içinde iş birliği yapar."},
            {"id": "uyum", "name": "Kurallara uymak", "kazanim": "Kurallara uymanın toplum için önemini kavrar."},
            {"id": "okul_yardim", "name": "Okulda yardımlaşma", "kazanim": "Okul arkadaşlarıyla yardımlaşmayı öğrenir."},
            {"id": "basari", "name": "Başarı ve çaba", "kazanim": "Başarının çabayla geldiğini fark eder."}
        ]
    },
    "guvenlik": {
        "id": "guvenlik",
        "name": "Günlük Yaşam ve Güvenlik",
        "icon": "shield",
        "color": "orange",
        "description": "Güvenli yaşam kuralları",
        "image": "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400",
        "subtopics": [
            {"id": "trafik", "name": "Trafik kuralları", "kazanim": "Temel trafik kurallarını fark eder."},
            {"id": "ev", "name": "Evde güvenlik", "kazanim": "Evde karşılaşılabilecek riskleri tanır."},
            {"id": "sokak", "name": "Sokakta güvenlik", "kazanim": "Sokakta güvenli davranışlar sergiler."},
            {"id": "yabanci", "name": "Yabancılarla iletişim", "kazanim": "Yabancılarla güvenli iletişim kurmayı öğrenir."},
            {"id": "acil", "name": "Acil durumlar", "kazanim": "Acil durumlarda yardım istemeyi öğrenir."},
            {"id": "internet", "name": "İnterneti güvenli kullanma", "kazanim": "Dijital ortamlarda güvenli davranışlar sergiler."},
            {"id": "teknoloji", "name": "Teknolojiyle dengeli zaman", "kazanim": "Teknolojiyi dengeli kullanmanın önemini kavrar."},
            {"id": "sinirlar", "name": "Kişisel sınırlar", "kazanim": "Kendi beden sınırlarını fark eder."},
            {"id": "aliskanlik", "name": "Sağlıklı alışkanlıklar", "kazanim": "Günlük sağlıklı alışkanlıklar geliştirir."},
            {"id": "zaman", "name": "Zamanı verimli kullanma", "kazanim": "Zamanı verimli kullanmanın önemini kavrar."}
        ]
    },
    "saglik": {
        "id": "saglik",
        "name": "Sağlıklı Yaşam",
        "icon": "activity",
        "color": "teal",
        "description": "Sağlıklı yaşam alışkanlıkları",
        "image": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400",
        "subtopics": [
            {"id": "dengeli", "name": "Dengeli beslenme", "kazanim": "Dengeli beslenmenin vücuda faydalarını kavrar."},
            {"id": "spor", "name": "Spor ve hareket", "kazanim": "Fiziksel aktivitenin sağlık için önemini fark eder."},
            {"id": "mikrop", "name": "Mikroplar ve hastalıklar", "kazanim": "Mikroplardan korunma yollarını öğrenir."},
            {"id": "temizlik_al", "name": "Temizlik alışkanlıkları", "kazanim": "Günlük temizlik alışkanlıkları geliştirir."},
            {"id": "doktor", "name": "Doktordan korkmamak", "kazanim": "Sağlık kontrollerinin önemini kavrar."},
            {"id": "secim", "name": "Sağlıklı seçimler", "kazanim": "Sağlıklı seçimler yapmayı öğrenir."},
            {"id": "koruma", "name": "Vücudumu koruyorum", "kazanim": "Vücudunu korumaya yönelik davranışlar geliştirir."},
            {"id": "dinlenme", "name": "Dinlenmenin önemi", "kazanim": "Dinlenme ve uykunun önemini kavrar."},
            {"id": "su_icme", "name": "Su içme alışkanlığı", "kazanim": "Yeterli su içmenin sağlık için önemini fark eder."},
            {"id": "rutin", "name": "Sağlıklı rutinler", "kazanim": "Günlük sağlıklı rutinler oluşturmayı öğrenir."}
        ]
    },
    "akademik": {
        "id": "akademik",
        "name": "Temel Akademik Kavramlar",
        "icon": "book",
        "color": "indigo",
        "description": "Öğrenmenin temelleri",
        "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400",
        "subtopics": [
            {"id": "sayilar", "name": "Sayılar", "kazanim": "Nesneleri sayar ve eşleştirir."},
            {"id": "renkler", "name": "Renkler", "kazanim": "Ana ve ara renkleri ayırt eder."},
            {"id": "sekiller", "name": "Şekiller", "kazanim": "Temel geometrik şekilleri tanır."},
            {"id": "zitlar", "name": "Zıt kavramlar", "kazanim": "Zıt kavramları ayırt eder."},
            {"id": "buyuk_kucuk", "name": "Büyük – küçük", "kazanim": "Büyüklük-küçüklük kavramlarını karşılaştırır."},
            {"id": "az_cok", "name": "Az – çok", "kazanim": "Miktar kavramlarını karşılaştırır."},
            {"id": "once_sonra", "name": "Önce – sonra", "kazanim": "Sıralama kavramını kavrar."},
            {"id": "zaman_kav", "name": "Zaman kavramı", "kazanim": "Günlük zaman dilimlerini fark eder."},
            {"id": "mekan", "name": "Mekân kavramı", "kazanim": "Mekânsal ilişkileri kavrar."},
            {"id": "problem", "name": "Problem çözme", "kazanim": "Basit problemleri çözme becerisi geliştirir."}
        ]
    },
    "kultur": {
        "id": "kultur",
        "name": "Kültür ve Toplum",
        "icon": "users",
        "color": "purple",
        "description": "Toplum ve birlikte yaşam",
        "image": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400",
        "subtopics": [
            {"id": "aile", "name": "Aile", "kazanim": "Aile bireylerinin rollerini tanır."},
            {"id": "buyukler", "name": "Büyüklerimize saygı", "kazanim": "Büyüklere saygı göstermenin önemini kavrar."},
            {"id": "komsuluk", "name": "Komşuluk", "kazanim": "İyi komşuluk ilişkilerinin önemini fark eder."},
            {"id": "bayramlar", "name": "Bayramlar", "kazanim": "Bayramların kültürel önemini kavrar."},
            {"id": "gelenekler", "name": "Gelenekler", "kazanim": "Kültürel geleneklerin önemini fark eder."},
            {"id": "yardim_kamp", "name": "Yardım kampanyaları", "kazanim": "Yardımlaşmanın toplumsal önemini kavrar."},
            {"id": "farkliliklar", "name": "Farklılıklar", "kazanim": "Farklılıklara saygı duymayı öğrenir."},
            {"id": "birlikte", "name": "Birlikte yaşamak", "kazanim": "Toplumsal uyumun önemini kavrar."},
            {"id": "toplumsal", "name": "Toplumsal kurallar", "kazanim": "Toplum kurallarına uymanın önemini fark eder."},
            {"id": "paylasma_kult", "name": "Paylaşma kültürü", "kazanim": "Paylaşma kültürünün değerini kavrar."}
        ]
    },
    "bilim": {
        "id": "bilim",
        "name": "Bilim ve Keşif",
        "icon": "rocket",
        "color": "cyan",
        "description": "Merak et, keşfet, öğren",
        "image": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400",
        "subtopics": [
            {"id": "uzay", "name": "Uzay ve gezegenler", "kazanim": "Uzay ve gezegenleri merak eder."},
            {"id": "gunes_ay", "name": "Güneş ve Ay", "kazanim": "Güneş ve Ay'ın özelliklerini öğrenir."},
            {"id": "deneyler", "name": "Basit deneyler", "kazanim": "Basit deneylerle bilimsel düşünme becerisi geliştirir."},
            {"id": "merak", "name": "Merak etmek", "kazanim": "Merakın öğrenme için önemini kavrar."},
            {"id": "bilim_insani", "name": "Bilim insanları", "kazanim": "Bilim insanlarının çalışmalarını tanır."},
            {"id": "teknoloji_ne", "name": "Teknoloji nedir?", "kazanim": "Teknolojinin hayatımızdaki yerini fark eder."},
            {"id": "makineler", "name": "Makineler nasıl çalışır?", "kazanim": "Basit makinelerin çalışma prensiplerini merak eder."},
            {"id": "neden_sonuc", "name": "Neden–sonuç ilişkisi", "kazanim": "Neden-sonuç ilişkisi kurmayı öğrenir."},
            {"id": "kesfetmek", "name": "Keşfetmek", "kazanim": "Yeni şeyler keşfetmenin heyecanını yaşar."},
            {"id": "soru", "name": "Soru sormak", "kazanim": "Soru sormanın öğrenmedeki önemini kavrar."}
        ]
    },
    "sanat": {
        "id": "sanat",
        "name": "Sanat ve Yaratıcılık",
        "icon": "palette",
        "color": "fuchsia",
        "description": "Hayal gücü ve yaratıcılık",
        "image": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400",
        "subtopics": [
            {"id": "resim", "name": "Resim yapmak", "kazanim": "Resim yaparak kendini ifade eder."},
            {"id": "muzik", "name": "Müzik", "kazanim": "Müziğin duygular üzerindeki etkisini fark eder."},
            {"id": "ritim", "name": "Ritim ve sesler", "kazanim": "Ritim duygusunu geliştirir."},
            {"id": "dans", "name": "Dans etmek", "kazanim": "Dansla kendini ifade etmeyi öğrenir."},
            {"id": "hayal", "name": "Hayal gücü", "kazanim": "Hayal gücünü kullanarak yaratıcılık geliştirir."},
            {"id": "drama", "name": "Drama ve canlandırma", "kazanim": "Drama etkinlikleriyle empati geliştirir."},
            {"id": "el", "name": "El becerileri", "kazanim": "İnce motor becerilerini geliştirir."},
            {"id": "renk_duygu", "name": "Renklerle duygular", "kazanim": "Renklerin duygularla ilişkisini keşfeder."},
            {"id": "ifade_sanat", "name": "Sanatla ifade", "kazanim": "Sanat yoluyla duygularını ifade etmeyi öğrenir."},
            {"id": "yaratici", "name": "Yaratıcı düşünme", "kazanim": "Yaratıcı düşünme becerisi geliştirir."}
        ]
    },
    "ahlak": {
        "id": "ahlak",
        "name": "Değerler ve Ahlak",
        "icon": "heart-handshake",
        "color": "red",
        "description": "Evrensel ahlaki değerler",
        "image": "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400",
        "subtopics": [
            {"id": "iyilik", "name": "İyilik yapmak", "kazanim": "İyilik yapmanın mutluluk verdiğini fark eder."},
            {"id": "dogru", "name": "Doğruyu söylemek", "kazanim": "Doğruyu söylemenin değerini kavrar."},
            {"id": "sabir_ahlak", "name": "Sabırlı olmak", "kazanim": "Sabrın önemini kavrar."},
            {"id": "affetmek", "name": "Affetmek", "kazanim": "Affetmenin huzur getirdiğini fark eder."},
            {"id": "sukretmek", "name": "Şükretmek", "kazanim": "Sahip olduklarına şükretmeyi öğrenir."},
            {"id": "emanet", "name": "Emanete sahip çıkmak", "kazanim": "Emanete sahip çıkmanın önemini kavrar."},
            {"id": "yardim_ahlak", "name": "Yardımseverlik", "kazanim": "Yardımseverliğin değerini kavrar."},
            {"id": "guzel", "name": "Güzel davranışlar", "kazanim": "Güzel davranışların önemini fark eder."},
            {"id": "vicdan", "name": "Vicdan", "kazanim": "Vicdanın davranışlara rehberlik ettiğini kavrar."},
            {"id": "iyi_insan", "name": "İyi insan olmak", "kazanim": "İyi insan olma bilinci geliştirir."}
        ]
    },
    "oz_bakim": {
        "id": "oz_bakim",
        "name": "Öz Bakım ve Bağımsızlık",
        "icon": "sparkles",
        "color": "lime",
        "description": "Kendi işlerimi yapabiliyorum",
        "image": "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400",
        "subtopics": [
            {"id": "giyinme", "name": "Kendi başıma giyinirim", "kazanim": "Kendi başına giyinme becerisi geliştirir."},
            {"id": "toplama", "name": "Eşyalarımı toplarım", "kazanim": "Düzen alışkanlığı kazanır."},
            {"id": "sorumluluk_oz", "name": "Sorumluluk alırım", "kazanim": "Yaşına uygun sorumluluklar alır."},
            {"id": "guven_oz", "name": "Kendime güveniyorum", "kazanim": "Öz güven geliştirir."},
            {"id": "hata", "name": "Hata yapabilirim", "kazanim": "Hatalardan öğrenmenin değerini kavrar."},
            {"id": "denemek", "name": "Denemekten korkmam", "kazanim": "Yeni şeyler deneme cesareti geliştirir."},
            {"id": "karar", "name": "Karar vermek", "kazanim": "Basit kararlar alma becerisi geliştirir."},
            {"id": "tanima", "name": "Kendimi tanıyorum", "kazanim": "Kendini tanıma becerisi geliştirir."},
            {"id": "bitirme", "name": "Başladığımı bitiririm", "kazanim": "İşlerini tamamlama alışkanlığı kazanır."},
            {"id": "bagimsizlik", "name": "Bağımsızlık", "kazanim": "Yaşına uygun bağımsızlık kazanır."}
        ]
    },
    "ozel": {
        "id": "ozel",
        "name": "Özel Temalar",
        "icon": "bookmark",
        "color": "slate",
        "description": "Öğretmen favorileri ve özel durumlar",
        "image": "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400",
        "subtopics": [
            {"id": "ilk_gun", "name": "İlk gün masalı", "kazanim": "Yeni başlangıçlara uyum sağlar."},
            {"id": "sinif_uyum", "name": "Sınıf uyum masalı", "kazanim": "Sınıf ortamına uyum sağlar."},
            {"id": "yeni_kardes", "name": "Yeni kardeş masalı", "kazanim": "Kardeş ilişkilerini olumlu şekilde geliştirir."},
            {"id": "tasinma", "name": "Taşınma masalı", "kazanim": "Değişimlere uyum sağlamayı öğrenir."},
            {"id": "hastane", "name": "Hastane masalı", "kazanim": "Hastane korkusunu yenmeyi öğrenir."},
            {"id": "dis_doktor", "name": "Diş doktoru masalı", "kazanim": "Diş doktoru korkusunu yener."},
            {"id": "kardes_kisk", "name": "Kardeş kıskançlığı", "kazanim": "Kardeş kıskançlığıyla başa çıkmayı öğrenir."},
            {"id": "kural_uyma", "name": "Kurallara uyma masalı", "kazanim": "Kurallara uymanın önemini kavrar."},
            {"id": "paylasma_ozel", "name": "Paylaşma masalı", "kazanim": "Paylaşmanın mutluluk getirdiğini fark eder."},
            {"id": "cesaret_ozel", "name": "Cesaret masalı", "kazanim": "Cesur olmanın önemini kavrar."}
        ]
    }
}

# Kazanım kategorileri
KAZANIM_CATEGORIES = {
    "sosyal_duygusal": {
        "name": "Sosyal-Duygusal Gelişim",
        "kazanimlar": [
            "Duygularını tanır ve ifade eder.",
            "Başkalarının duygularını anlamaya çalışır.",
            "Öfke duygusunu uygun yollarla kontrol etmeyi öğrenir.",
            "Kendine güven duygusu geliştirir.",
            "Sağlıklı arkadaşlık ilişkileri kurar.",
            "Paylaşmanın sosyal ilişkileri güçlendirdiğini fark eder.",
            "İş birliği ve yardımlaşmanın önemini kavrar."
        ]
    },
    "bilissel": {
        "name": "Bilişsel Gelişim",
        "kazanimlar": [
            "Nesneleri sayar ve eşleştirir.",
            "Temel geometrik şekilleri tanır.",
            "Zıt kavramları ayırt eder.",
            "Neden-sonuç ilişkisi kurmayı öğrenir.",
            "Basit problemleri çözme becerisi geliştirir.",
            "Merakın öğrenme için önemini kavrar."
        ]
    },
    "dil": {
        "name": "Dil Gelişimi",
        "kazanimlar": [
            "Duygularını uygun şekilde ifade etmeyi öğrenir.",
            "Soru sormanın öğrenmedeki önemini kavrar.",
            "Kendini ifade etme becerisi geliştirir."
        ]
    },
    "motor": {
        "name": "Motor Gelişim",
        "kazanimlar": [
            "İnce motor becerilerini geliştirir.",
            "Fiziksel aktivitenin sağlık için önemini fark eder.",
            "Kendi başına giyinme becerisi geliştirir."
        ]
    },
    "oz_bakim": {
        "name": "Öz Bakım Becerileri",
        "kazanimlar": [
            "Kişisel temizliğin sağlık için önemini fark eder.",
            "Diş sağlığını korumaya yönelik alışkanlıklar geliştirir.",
            "Günlük sağlıklı alışkanlıklar geliştirir.",
            "Düzen alışkanlığı kazanır."
        ]
    }
}

def get_all_topics():
    """Tüm ana kategorileri döndür"""
    return [
        {
            "id": topic["id"],
            "name": topic["name"],
            "icon": topic["icon"],
            "color": topic["color"],
            "description": topic["description"],
            "image": topic["image"],
            "subtopic_count": len(topic["subtopics"])
        }
        for topic in TOPICS_DATABASE.values()
    ]

def get_topic_detail(topic_id: str):
    """Belirli bir kategorinin detaylarını döndür"""
    return TOPICS_DATABASE.get(topic_id)

def get_subtopics(topic_id: str):
    """Bir kategorinin alt konularını döndür"""
    topic = TOPICS_DATABASE.get(topic_id)
    if topic:
        return topic["subtopics"]
    return []

def get_subtopic_by_id(topic_id: str, subtopic_id: str):
    """Belirli bir alt konuyu döndür"""
    topic = TOPICS_DATABASE.get(topic_id)
    if topic:
        for subtopic in topic["subtopics"]:
            if subtopic["id"] == subtopic_id:
                return subtopic
    return None

def search_by_kazanim(keyword: str):
    """Kazanıma göre konu ara"""
    results = []
    for topic_id, topic in TOPICS_DATABASE.items():
        for subtopic in topic["subtopics"]:
            if keyword.lower() in subtopic["kazanim"].lower():
                results.append({
                    "topic_id": topic_id,
                    "topic_name": topic["name"],
                    "subtopic_id": subtopic["id"],
                    "subtopic_name": subtopic["name"],
                    "kazanim": subtopic["kazanim"]
                })
    return results

def get_all_subtopics_flat():
    """Tüm alt konuları düz liste olarak döndür"""
    results = []
    for topic_id, topic in TOPICS_DATABASE.items():
        for subtopic in topic["subtopics"]:
            results.append({
                "topic_id": topic_id,
                "topic_name": topic["name"],
                "topic_color": topic["color"],
                "subtopic_id": subtopic["id"],
                "subtopic_name": subtopic["name"],
                "kazanim": subtopic["kazanim"]
            })
    return results
