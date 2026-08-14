# Mimari

Padrosdown, kullanıcı notlarını normal Markdown dosyaları olarak tutan Linux öncelikli bir Tauri 2 uygulamasıdır. Uygulama verisi ile notlar arasındaki sınır bilinçli olarak korunur.

## Katmanlar

```text
React bileşenleri
  → Zustand store ve feature hook'ları
    → frontend servisleri
      → Tauri command wrapper'ları
        → Rust command katmanı
          → Rust servisleri ve dosya sistemi
```

- `src/app`: uygulama kabuğu ve üst düzey düzen
- `src/components`: yeniden kullanılabilir görsel bileşenler
- `src/features`: dosya ağacı, editör, arama, günlük not gibi özellikler
- `src/stores`: kalıcı ve geçici UI durumu
- `src/services`: UI'dan bağımsız frontend iş akışları ve Tauri çağrıları
- `src/types`: frontend ortak veri tipleri
- `src-tauri/src/commands`: frontend'e açılan dar komut yüzeyi
- `src-tauri/src/services`: uygulama iş kuralları
- `src-tauri/src/filesystem`: yol doğrulama ve güvenli dosya işlemleri
- `src-tauri/src/search`: çalışma alanı araması
- `src-tauri/src/activity`: yazım oturumu ve aktivite takibi

## Güvenlik sınırı

Seçilen çalışma alanı Rust uygulama durumunda tutulur. Göreli yollar normalize edilir, kanonik çalışma alanıyla karşılaştırılır ve çalışma alanı dışına çıkan işlemler reddedilir. Frontend kontrolleri kullanıcı deneyimi sağlar ancak güvenlik kararı değildir.

Dosyalar mümkün olduğunda aynı dizindeki geçici bir dosyaya yazılır ve ardından atomik olarak hedefin yerini alır. Silme işlemleri kullanıcı onayı gerektirir ve desteklenen sistemlerde çöp kutusunu kullanır.

## Kalıcı veriler

- Kullanıcı içeriği: seçilen çalışma alanındaki `.md` ve `.markdown` dosyaları
- Uygulama meta verisi: çalışma alanındaki `.hypomnema` veya Tauri store verisi
- Oturum durumu: açık sekmeler, son aktif dosya ve ayarlar

Uygulama kaldırıldığında Markdown dosyaları bağımsız ve okunabilir kalır.
