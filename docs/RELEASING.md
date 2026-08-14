# Sürüm yayınlama

## Hazırlık

1. Sürümü `package.json`, `src-tauri/Cargo.toml` ve `src-tauri/tauri.conf.json` içinde aynı değere yükseltin.
2. `package-lock.json` ve `src-tauri/Cargo.lock` dosyalarını güncelleyin.
3. `CHANGELOG.md` içindeki `Unreleased` bölümünü tarihli sürüme taşıyın.
4. `npm run check` ve Rust kalite kontrollerini çalıştırın.
5. `./install.sh` ile temiz bir kullanıcı kurulumu doğrulayın.
6. CI başarılı olduktan sonra `vX.Y.Z` biçiminde imzalı veya açıklamalı bir etiket oluşturun.

## Yayın içeriği

Padrosdown'ın temel dağıtım yolu kaynak kodu ve `install.sh` dosyasıdır. GitHub sürüm notlarında şunları belirtin:

- Desteklenen Linux dağıtımları ve masaüstü ortamları
- Gerekli sistem paketleri
- Kullanıcıya dönük değişiklikler
- Bilinen sınırlamalar
- Kaynaktan kurulum ve kaldırma komutları

Release dalına API anahtarı, gerçek kullanıcı notu, makineye özel mutlak yol veya geliştirme ortamı kayıtları eklemeyin.
