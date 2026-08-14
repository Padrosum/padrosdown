use crate::{
    errors::{AppError, AppResult},
    models::{FileNode, FileNodeKind},
};
use std::{
    ffi::OsStr,
    fs::{self, File},
    io::Write,
    path::{Component, Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};
const IGNORED_DIRECTORIES: [&str; 4] = [".git", "node_modules", ".hypomnema", "target"];

pub fn validate_workspace(path: &Path) -> AppResult<PathBuf> {
    let canonical = path
        .canonicalize()
        .map_err(|error| AppError::io("Çalışma alanı açılamadı", error))?;
    if !canonical.is_dir() {
        return Err(AppError::InvalidWorkspace(
            "Seçilen yol bir klasör değil.".to_owned(),
        ));
    }
    Ok(canonical)
}

pub fn is_markdown_file(path: &Path) -> bool {
    path.extension()
        .and_then(OsStr::to_str)
        .is_some_and(|extension| {
            extension.eq_ignore_ascii_case("md") || extension.eq_ignore_ascii_case("markdown")
        })
}

pub fn validate_relative_path(relative: &Path) -> AppResult<()> {
    if relative.as_os_str().is_empty() || relative.is_absolute() {
        return Err(AppError::InvalidPath("Yol göreli olmalıdır.".to_owned()));
    }
    if relative
        .components()
        .any(|component| !matches!(component, Component::Normal(_)))
    {
        return Err(AppError::InvalidPath(
            "Yol çalışma alanı dışına çıkamaz.".to_owned(),
        ));
    }
    Ok(())
}

pub fn resolve_existing(root: &Path, relative: &Path) -> AppResult<PathBuf> {
    validate_relative_path(relative)?;
    let candidate = root.join(relative);
    let canonical = candidate
        .canonicalize()
        .map_err(|error| match error.kind() {
            std::io::ErrorKind::NotFound => AppError::NotFound("Dosya bulunamadı.".to_owned()),
            _ => AppError::io("Dosya yolu doğrulanamadı", error),
        })?;
    if !canonical.starts_with(root) {
        return Err(AppError::InvalidPath(
            "Yol çalışma alanı dışına çıkamaz.".to_owned(),
        ));
    }
    Ok(canonical)
}

fn resolve_for_write(root: &Path, relative: &Path) -> AppResult<PathBuf> {
    validate_relative_path(relative)?;
    if !is_markdown_file(relative) {
        return Err(AppError::UnsupportedFile(
            "Yalnızca Markdown dosyaları yazılabilir.".to_owned(),
        ));
    }
    let candidate = root.join(relative);
    let parent = candidate
        .parent()
        .ok_or_else(|| AppError::InvalidPath("Geçersiz dosya yolu.".to_owned()))?;
    let canonical_parent = parent
        .canonicalize()
        .map_err(|error| AppError::io("Üst klasör doğrulanamadı", error))?;
    if !canonical_parent.starts_with(root) {
        return Err(AppError::InvalidPath(
            "Yol çalışma alanı dışına çıkamaz.".to_owned(),
        ));
    }
    let file_name = candidate
        .file_name()
        .ok_or_else(|| AppError::InvalidPath("Geçersiz dosya adı.".to_owned()))?;
    Ok(canonical_parent.join(file_name))
}

pub fn resolve_new_path(root: &Path, relative: &Path) -> AppResult<PathBuf> {
    validate_relative_path(relative)?;
    let candidate = root.join(relative);
    if candidate.exists() {
        return Err(AppError::InvalidPath("Hedef zaten var.".to_owned()));
    }
    let parent = candidate
        .parent()
        .ok_or_else(|| AppError::InvalidPath("Geçersiz hedef yolu.".to_owned()))?;
    let canonical_parent = parent
        .canonicalize()
        .map_err(|error| AppError::io("Hedef klasör doğrulanamadı", error))?;
    if !canonical_parent.starts_with(root) {
        return Err(AppError::InvalidPath(
            "Hedef çalışma alanı dışına çıkamaz.".to_owned(),
        ));
    }
    let name = candidate
        .file_name()
        .ok_or_else(|| AppError::InvalidPath("Geçersiz hedef adı.".to_owned()))?;
    Ok(canonical_parent.join(name))
}

pub fn create_markdown(root: &Path, relative: &Path, content: &str) -> AppResult<()> {
    if !is_markdown_file(relative) {
        return Err(AppError::UnsupportedFile(
            "Dosya uzantısı .md veya .markdown olmalıdır.".to_owned(),
        ));
    }
    let destination = resolve_new_path(root, relative)?;
    let mut options = fs::OpenOptions::new();
    options.write(true).create_new(true);
    let mut file = options
        .open(destination)
        .map_err(|error| AppError::io("Dosya oluşturulamadı", error))?;
    file.write_all(content.as_bytes())
        .map_err(|error| AppError::io("Dosya içeriği yazılamadı", error))?;
    file.sync_all()
        .map_err(|error| AppError::io("Dosya diske aktarılamadı", error))
}

pub fn create_directory(root: &Path, relative: &Path) -> AppResult<()> {
    let destination = resolve_new_path(root, relative)?;
    fs::create_dir(destination).map_err(|error| AppError::io("Klasör oluşturulamadı", error))
}

pub fn move_entry(root: &Path, source: &Path, destination: &Path) -> AppResult<()> {
    let source_path = resolve_existing(root, source)?;
    let destination_path = resolve_new_path(root, destination)?;
    if source_path.is_file()
        && (!is_markdown_file(&source_path) || !is_markdown_file(&destination_path))
    {
        return Err(AppError::UnsupportedFile(
            "Markdown dosyasının uzantısı korunmalıdır.".to_owned(),
        ));
    }
    fs::rename(source_path, destination_path)
        .map_err(|error| AppError::io("Dosya veya klasör taşınamadı", error))
}

pub fn trash_entry(root: &Path, relative: &Path) -> AppResult<()> {
    let path = resolve_existing(root, relative)?;
    if path == root {
        return Err(AppError::InvalidPath("Çalışma alanı silinemez.".to_owned()));
    }
    trash::delete(path)
        .map_err(|error| AppError::Io(format!("Öğe çöp kutusuna taşınamadı: {error}")))
}

fn should_ignore_directory(name: &str) -> bool {
    name.starts_with('.') || IGNORED_DIRECTORIES.contains(&name)
}

fn relative_string(root: &Path, path: &Path) -> AppResult<String> {
    path.strip_prefix(root)
        .map(|relative| relative.to_string_lossy().replace('\\', "/"))
        .map_err(|_| AppError::InvalidPath("Göreli yol oluşturulamadı.".to_owned()))
}

fn scan_directory(root: &Path, directory: &Path) -> AppResult<Vec<FileNode>> {
    let entries =
        fs::read_dir(directory).map_err(|error| AppError::io("Klasör okunamadı", error))?;
    let mut nodes = Vec::new();

    for entry_result in entries {
        let entry =
            entry_result.map_err(|error| AppError::io("Klasör girdisi okunamadı", error))?;
        let file_type = entry
            .file_type()
            .map_err(|error| AppError::io("Dosya türü okunamadı", error))?;
        if file_type.is_symlink() {
            continue;
        }
        let name = entry.file_name().to_string_lossy().into_owned();
        let path = entry.path();

        if file_type.is_dir() {
            if should_ignore_directory(&name) {
                continue;
            }
            let children = scan_directory(root, &path)?;
            nodes.push(FileNode {
                name,
                path: relative_string(root, &path)?,
                kind: FileNodeKind::Directory,
                children,
            });
        } else if file_type.is_file() && is_markdown_file(&path) && !name.starts_with('.') {
            nodes.push(FileNode {
                name,
                path: relative_string(root, &path)?,
                kind: FileNodeKind::File,
                children: Vec::new(),
            });
        }
    }

    nodes.sort_by(|left, right| {
        let left_rank = matches!(left.kind, FileNodeKind::File);
        let right_rank = matches!(right.kind, FileNodeKind::File);
        left_rank
            .cmp(&right_rank)
            .then_with(|| left.name.to_lowercase().cmp(&right.name.to_lowercase()))
    });
    Ok(nodes)
}

pub fn collect_markdown_paths(root: &Path) -> AppResult<Vec<PathBuf>> {
    fn visit(directory: &Path, files: &mut Vec<PathBuf>) -> AppResult<()> {
        for entry in
            fs::read_dir(directory).map_err(|error| AppError::io("Klasör okunamadı", error))?
        {
            let entry = entry.map_err(|error| AppError::io("Klasör girdisi okunamadı", error))?;
            let kind = entry
                .file_type()
                .map_err(|error| AppError::io("Dosya türü okunamadı", error))?;
            if kind.is_symlink() {
                continue;
            }
            let name = entry.file_name().to_string_lossy().into_owned();
            if kind.is_dir() && !should_ignore_directory(&name) {
                visit(&entry.path(), files)?;
            } else if kind.is_file() && !name.starts_with('.') && is_markdown_file(&entry.path()) {
                files.push(entry.path());
            }
        }
        Ok(())
    }
    let mut files = Vec::new();
    visit(root, &mut files)?;
    Ok(files)
}

pub fn list_markdown_tree(root: &Path) -> AppResult<Vec<FileNode>> {
    scan_directory(root, root)
}

pub fn read_markdown(root: &Path, relative: &Path) -> AppResult<String> {
    if !is_markdown_file(relative) {
        return Err(AppError::UnsupportedFile(
            "Yalnızca Markdown dosyaları okunabilir.".to_owned(),
        ));
    }
    let path = resolve_existing(root, relative)?;
    if !path.is_file() {
        return Err(AppError::InvalidPath(
            "Seçilen yol bir dosya değil.".to_owned(),
        ));
    }
    fs::read_to_string(path).map_err(|error| AppError::io("Markdown dosyası okunamadı", error))
}

pub fn atomic_write_markdown(root: &Path, relative: &Path, content: &str) -> AppResult<()> {
    let destination = resolve_for_write(root, relative)?;
    let parent = destination
        .parent()
        .ok_or_else(|| AppError::InvalidPath("Geçersiz dosya yolu.".to_owned()))?;
    let nonce = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|_| AppError::State("Sistem saati geçersiz.".to_owned()))?
        .as_nanos();
    let temporary = parent.join(format!(".padrosdown-{}-{nonce}.tmp", std::process::id()));

    let result = (|| -> AppResult<()> {
        let mut file = File::create(&temporary)
            .map_err(|error| AppError::io("Geçici dosya oluşturulamadı", error))?;
        file.write_all(content.as_bytes())
            .map_err(|error| AppError::io("Dosya yazılamadı", error))?;
        file.sync_all()
            .map_err(|error| AppError::io("Dosya diske aktarılamadı", error))?;
        fs::rename(&temporary, &destination)
            .map_err(|error| AppError::io("Dosya atomik olarak değiştirilemedi", error))?;
        Ok(())
    })();

    if result.is_err() {
        let _cleanup_result = fs::remove_file(&temporary);
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn workspace_must_be_an_existing_directory() -> Result<(), Box<dyn std::error::Error>> {
        let directory = tempdir()?;
        assert_eq!(
            validate_workspace(directory.path())?,
            directory.path().canonicalize()?
        );
        assert!(validate_workspace(&directory.path().join("missing")).is_err());
        Ok(())
    }

    #[test]
    fn traversal_and_absolute_paths_are_rejected() -> Result<(), Box<dyn std::error::Error>> {
        let directory = tempdir()?;
        assert!(resolve_existing(directory.path(), Path::new("../secret.md")).is_err());
        assert!(resolve_existing(directory.path(), Path::new("/etc/passwd")).is_err());
        Ok(())
    }

    #[cfg(unix)]
    #[test]
    fn symlink_escape_is_rejected() -> Result<(), Box<dyn std::error::Error>> {
        use std::os::unix::fs::symlink;
        let workspace = tempdir()?;
        let outside = tempdir()?;
        fs::write(outside.path().join("secret.md"), "secret")?;
        symlink(outside.path(), workspace.path().join("escape"))?;
        assert!(resolve_existing(workspace.path(), Path::new("escape/secret.md")).is_err());
        Ok(())
    }

    #[test]
    fn markdown_filter_is_case_insensitive() {
        assert!(is_markdown_file(Path::new("note.md")));
        assert!(is_markdown_file(Path::new("note.MARKDOWN")));
        assert!(!is_markdown_file(Path::new("image.png")));
    }

    #[test]
    fn tree_filters_hidden_and_non_markdown_files() -> Result<(), Box<dyn std::error::Error>> {
        let directory = tempdir()?;
        fs::create_dir(directory.path().join("docs"))?;
        fs::create_dir(directory.path().join(".git"))?;
        fs::write(directory.path().join("docs/note.md"), "hello")?;
        fs::write(directory.path().join("docs/data.bin"), [0, 159, 146, 150])?;
        fs::write(directory.path().join(".hidden.md"), "hidden")?;
        fs::write(directory.path().join(".git/ignored.md"), "ignored")?;

        let tree = list_markdown_tree(directory.path())?;
        assert_eq!(tree.len(), 1);
        assert_eq!(tree[0].name, "docs");
        assert_eq!(tree[0].children.len(), 1);
        assert_eq!(tree[0].children[0].name, "note.md");
        Ok(())
    }

    #[test]
    fn atomic_write_replaces_markdown_without_temp_file() -> Result<(), Box<dyn std::error::Error>>
    {
        let directory = tempdir()?;
        let target = directory.path().join("note.md");
        fs::write(&target, "old")?;
        atomic_write_markdown(directory.path(), Path::new("note.md"), "new content")?;
        assert_eq!(fs::read_to_string(target)?, "new content");
        assert_eq!(fs::read_dir(directory.path())?.count(), 1);
        Ok(())
    }
}
