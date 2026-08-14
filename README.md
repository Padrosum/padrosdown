# padrosdown

Linux ve özellikle KDE Plasma için geliştirilen, notları kullanıcının seçtiği klasörde normal Markdown dosyaları olarak tutan Tauri 2 masaüstü çalışma alanı. Özel dosya formatı yoktur; uygulama kaldırıldığında notlar `.md`/`.markdown` dosyaları olarak kalır.

> **Durum:** Proje `0.1.0` erken geliştirme sürümündedir. Linux ana hedef platformdur; Windows ve macOS henüz doğrulanmamıştır.

## Özellikler

- Ortalanmış Zen Writer editörü ve soldan açılan, yeniden boyutlandırılabilir dosya çekmecesi
- Günlük not, hızlı eylemler, son dosyalar ve kompakt Son 7 Gün özeti içeren sakin başlangıç ekranı
- Sekmeler, oturum geri yükleme ve dosya başına sıralı 600 ms otomatik kaydetme
- Dosya/klasör oluşturma, yeniden adlandırma, taşıma ve onaylı sistem çöp kutusu
- Günlük not, hızlı not, bulanık komut paleti ve değiştirilebilir kısayollar
- Rust tarafında dosya adı/içerik araması ve eşleşen satıra geçiş
- Gruplanmış aktivite kaydı ve Son 7 Gün panosu

## Vim benzeri komutlar

Editör dışında `:` tuşu komut paletini açar. Editör içindeyken normal `:` yazımı korunur;
komut kipine geçmek için `Esc` ardından `:` kullanılır.

- `:w`, `:q`, `:wq`: kaydet, sekmeyi kapat, kaydet ve kapat
- `:e`, `:find`, `:new`, `:today`: çalışma alanı, arama, yeni dosya ve günlük not
- `:note`, `:recent`, `:week`, `:theme`, `:set`: hızlı not, aktivite, tema ve ayarlar

## Gereksinimler

- Node.js 20 veya üzeri
- Rust stable
- Linux Tauri 2 bağımlılıkları (`webkit2gtk-4.1`, `javascriptcoregtk-4.1`)

Debian/Ubuntu:

```bash
sudo apt update
sudo apt install libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

Fedora:

```bash
sudo dnf check-update
sudo dnf install webkit2gtk4.1-devel openssl-devel curl wget file libappindicator-gtk3-devel librsvg2-devel libxdo-devel
sudo dnf group install "C Development Tools and Libraries"
```

Arch Linux örneği:

```bash
sudo pacman -S --needed webkit2gtk-4.1 base-devel curl wget file openssl appmenu-gtk-module libappindicator-gtk3 librsvg
```

## Kaynaktan derleme ve kurulum

Sistem geneline `/usr/local` altına derlemek ve kurmak için:

```bash
./install.sh
```

Script derlemeyi normal kullanıcıyla yapar ve yalnızca `/usr/local` kurulum adımında gerekirse `sudo` ister. Yalnızca mevcut kullanıcıya kurmak için:

```bash
./install.sh --user
```

Özel bir mutlak prefix de verilebilir: `./install.sh --prefix /opt/padrosdown`.

Script release binary'sini Tauri `custom-protocol` özelliğiyle üretir; böylece uygulama Vite geliştirme sunucusuna ihtiyaç duymadan derlenmiş frontend dosyalarını kendi içinden yükler.

## Geliştirme

```bash
npm ci
npm run tauri:dev
```

Yalnızca web arayüzü:

```bash
npm run dev
```

## Doğrulama

```bash
npm run check
cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check
cargo test --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings
```

Paket üretmeden release binary derlemek için `npm run build` ardından `cargo build --manifest-path src-tauri/Cargo.toml --release --features custom-protocol` kullanılabilir. GitHub pull request'lerinde aynı kontroller `.github/workflows/ci.yml` tarafından çalıştırılır.

## Güvenlik modeli

Çalışma alanı Rust tarafında canonicalize edilir. Mutlak yollar, kök dışına çıkan `..`, symlink kaçışları ve Markdown dışı belge erişimi reddedilir. Dosya ağacı gizli girdileri, symlinkleri ve binary dosyaları taramaz. Yazma işlemi aynı klasörde geçici dosya oluşturup atomik rename kullanır. Silme kalıcı değildir ve açık onaydan sonra sistem çöp kutusuna gider.

Frontend'e genel filesystem izni verilmez. Ham Markdown HTML'i çalıştırılmaz ve dosya içerikleri veya mutlak yollar loglanmaz.

Aktivite verisi notlardan ayrı olarak `.hypomnema/activity.json` içinde tutulur.

## Katkıda bulunma

Katkı akışı ve mimari sınırlar için [CONTRIBUTING.md](CONTRIBUTING.md) ile [mimari belgesine](docs/ARCHITECTURE.md) bakın. Güvenlik açıkları herkese açık issue olarak paylaşılmamalıdır; ayrıntılar [SECURITY.md](SECURITY.md) içindedir.

## GitHub'da yayınlama kontrol listesi

1. Uygun bir açık kaynak lisansı seçip köke `LICENSE` dosyası ekleyin.
2. Git deposunu oluşturun, varsayılan dalı `main` yapın ve GitHub uzak deposunu ekleyin.
3. GitHub Actions çalıştırmalarını ve Dependabot pull request'lerini etkinleştirin.
4. Depo ayarlarından Private Vulnerability Reporting özelliğini açın.
5. CI başarılı olduktan sonra ilk sürüm etiketini oluşturun; süreç [sürümleme belgesinde](docs/RELEASING.md) açıklanır.

Lisans seçimi tamamlandıktan sonra ilk yayını oluşturmak için:

```bash
git add .
git commit -m "chore: prepare initial Padrosdown release"
git remote add origin git@github.com:KULLANICI_ADI/padrosdown.git
git push -u origin main
```

HTTPS kullanıyorsanız `origin` adresini GitHub'ın verdiği HTTPS adresiyle değiştirin. Depo adı veya hesabınız farklıysa örnek adresi buna göre düzenleyin.
