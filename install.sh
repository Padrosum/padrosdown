#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
if [[ -z "${SCRIPT_DIR}" || ! -f "${SCRIPT_DIR}/package.json" || ! -f "${SCRIPT_DIR}/src-tauri/Cargo.toml" ]]; then
  echo "Hata: padrosdown proje kökü doğrulanamadı." >&2
  exit 1
fi

INSTALL_PREFIX="/usr/local"
if [[ "${1:-}" == "--user" ]]; then
  USER_DIRECTORY="$(getent passwd "$(id -u)" | cut -d: -f6)"
  if [[ -z "${USER_DIRECTORY}" || ! -d "${USER_DIRECTORY}" ]]; then
    echo "Hata: kullanıcı dizini güvenli biçimde bulunamadı." >&2
    exit 1
  fi
  INSTALL_PREFIX="${USER_DIRECTORY}/.local"
elif [[ "${1:-}" == "--prefix" ]]; then
  if [[ -z "${2:-}" || "${2}" != /* || "${2}" == "/" ]]; then
    echo "Kullanım: ./install.sh [--user | --prefix /mutlak/yol]" >&2
    exit 1
  fi
  INSTALL_PREFIX="${2%/}"
elif [[ -n "${1:-}" ]]; then
  echo "Kullanım: ./install.sh [--user | --prefix /mutlak/yol]" >&2
  exit 1
fi

for command_name in node npm cargo rustc pkg-config install; do
  if ! command -v "${command_name}" >/dev/null 2>&1; then
    echo "Hata: gerekli komut bulunamadı: ${command_name}" >&2
    exit 1
  fi
done

for library_name in webkit2gtk-4.1 javascriptcoregtk-4.1; do
  if ! pkg-config --exists "${library_name}"; then
    echo "Hata: ${library_name} geliştirme paketi kurulu değil." >&2
    exit 1
  fi
done

echo "Frontend bağımlılıkları kuruluyor…"
(cd "${SCRIPT_DIR}" && npm ci)
echo "Frontend derleniyor…"
(cd "${SCRIPT_DIR}" && npm run build)
echo "Rust release binary derleniyor…"
(cd "${SCRIPT_DIR}" && cargo build --manifest-path src-tauri/Cargo.toml --release --features custom-protocol)

BINARY_SOURCE="${SCRIPT_DIR}/src-tauri/target/release/padrosdown"
ICON_SOURCE="${SCRIPT_DIR}/src-tauri/icons/icon.png"
DESKTOP_SOURCE="${SCRIPT_DIR}/packaging/io.github.padrosdown.desktop"
for source_path in "${BINARY_SOURCE}" "${ICON_SOURCE}" "${DESKTOP_SOURCE}"; do
  if [[ ! -f "${source_path}" ]]; then
    echo "Hata: kurulum girdisi bulunamadı: ${source_path}" >&2
    exit 1
  fi
done
if [[ ! -x "${BINARY_SOURCE}" ]]; then
  echo "Hata: derlenen padrosdown binary'si çalıştırılabilir değil." >&2
  exit 1
fi

INSTALL_COMMAND=(install)
PROBE_PARENT="$(dirname -- "${INSTALL_PREFIX}")"
if [[ ! -w "${INSTALL_PREFIX}" && ! -w "${PROBE_PARENT}" ]]; then
  if ! command -v sudo >/dev/null 2>&1; then
    echo "Hata: ${INSTALL_PREFIX} için yazma izni yok ve sudo bulunamadı." >&2
    exit 1
  fi
  INSTALL_COMMAND=(sudo install)
fi

BIN_DIRECTORY="${INSTALL_PREFIX}/bin"
APPLICATION_DIRECTORY="${INSTALL_PREFIX}/share/applications"
ICON_DIRECTORY="${INSTALL_PREFIX}/share/icons/hicolor/512x512/apps"
"${INSTALL_COMMAND[@]}" -d -m 755 "${BIN_DIRECTORY}" "${APPLICATION_DIRECTORY}" "${ICON_DIRECTORY}"
"${INSTALL_COMMAND[@]}" -m 755 "${BINARY_SOURCE}" "${BIN_DIRECTORY}/padrosdown"
"${INSTALL_COMMAND[@]}" -m 644 "${DESKTOP_SOURCE}" "${APPLICATION_DIRECTORY}/io.github.padrosdown.desktop"
"${INSTALL_COMMAND[@]}" -m 644 "${ICON_SOURCE}" "${ICON_DIRECTORY}/padrosdown.png"

echo "padrosdown kuruldu: ${BIN_DIRECTORY}/padrosdown"
echo "Çalıştırmak için: padrosdown"
