## Değişiklik

Bu PR'ın neyi ve neden değiştirdiğini kısaca açıklayın.

## Doğrulama

- [ ] `npm run check`
- [ ] `cargo fmt --manifest-path src-tauri/Cargo.toml --all -- --check`
- [ ] `cargo test --manifest-path src-tauri/Cargo.toml`
- [ ] `cargo clippy --manifest-path src-tauri/Cargo.toml --all-targets -- -D warnings`
- [ ] Linux üzerinde ilgili akış elle doğrulandı veya neden doğrulanamadığı açıklandı.

## Güvenlik ve veri

- [ ] Çalışma alanı sınırı Rust tarafında korunuyor.
- [ ] Kişisel not içeriği, API anahtarı veya mutlak dosya yolu loglanmıyor.
- [ ] Kullanıcı verisini değiştiren yeni davranış açıkça belgelenmiş durumda.

## Görsel değişiklikler

Varsa ekran görüntüsü veya kısa kayıt ekleyin; kişisel dosya yollarını gizleyin.
