# Padrosdown'a katkı

Katkılar hata düzeltmesi, küçük ve odaklı özellikler, testler ve belge iyileştirmeleri olarak memnuniyetle karşılanır. Büyük bir değişikliğe başlamadan önce yaklaşımı bir issue üzerinden netleştirmek, gereksiz çalışmayı önler.

## Geliştirme ortamı

Gerekli sistem paketlerini [README](README.md#gereksinimler) bölümüne göre kurun. Ardından:

```bash
npm ci
npm run tauri:dev
```

Node.js sürümü `.nvmrc`, Rust araç zinciri `rust-toolchain.toml` tarafından tanımlanır.

## Mimari sınırlar

- React bileşenleri Tauri `invoke` çağrılarını doğrudan yapmaz; `src/services` katmanını kullanır.
- Dosya sistemi güvenlik sınırları yalnızca arayüzde değil, Rust tarafında da doğrulanır.
- Çalışma alanı dışına çıkan yollar kabul edilmez.
- Kullanıcı notları özel bir formata dönüştürülmez; normal Markdown olarak kalır.
- Kişisel not içerikleri, sırlar ve mutlak dosya yolları loglanmaz.
- Yeni bağımlılık eklerken boyut, bakım durumu ve gerçekten gerekli olup olmadığı değerlendirilir.

Daha ayrıntılı görünüm için [mimari belgesine](docs/ARCHITECTURE.md) bakın.

## Değişiklik akışı

1. Değişikliğiniz için kısa ve açıklayıcı bir dal oluşturun.
2. Davranış değişiklikleri için test ekleyin veya mevcut testi güncelleyin.
3. Kullanıcıya dönük değişikliği `CHANGELOG.md` dosyasının `Unreleased` bölümüne ekleyin.
4. Yerel kontrolleri çalıştırın.
5. Küçük, tek amaçlı ve açıklayıcı bir pull request açın.

## Kontroller

Frontend kontrollerinin tamamı:

```bash
npm run check
```

Rust kontrolleri:

```bash
cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

Linux uygulama derlemesi:

```bash
npm run build
cargo build --manifest-path src-tauri/Cargo.toml --release --features custom-protocol
```

## Hata ve güvenlik bildirimleri

Normal hatalar için GitHub issue şablonunu kullanın. Güvenlik açığını herkese açık issue olarak bildirmeyin; [güvenlik politikasını](SECURITY.md) izleyin.
