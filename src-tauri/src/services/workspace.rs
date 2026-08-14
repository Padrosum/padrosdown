use crate::{
    errors::{AppError, AppResult},
    filesystem,
    models::FileNode,
    state::AppState,
};
use std::path::{Path, PathBuf};

pub fn current_root(state: &AppState) -> AppResult<PathBuf> {
    state
        .workspace
        .read()
        .map_err(|_| AppError::State("Çalışma alanı durumu okunamadı.".to_owned()))?
        .clone()
        .ok_or_else(|| AppError::WorkspaceNotSelected("Önce bir çalışma alanı seçin.".to_owned()))
}

pub fn set_root(state: &AppState, path: &Path) -> AppResult<PathBuf> {
    let canonical = filesystem::validate_workspace(path)?;
    let mut workspace = state
        .workspace
        .write()
        .map_err(|_| AppError::State("Çalışma alanı durumu güncellenemedi.".to_owned()))?;
    *workspace = Some(canonical.clone());
    Ok(canonical)
}

pub fn list_files(state: &AppState) -> AppResult<Vec<FileNode>> {
    filesystem::list_markdown_tree(&current_root(state)?)
}

pub fn read_file(state: &AppState, relative: &Path) -> AppResult<String> {
    filesystem::read_markdown(&current_root(state)?, relative)
}

pub fn write_file(state: &AppState, relative: &Path, content: &str) -> AppResult<()> {
    let root = current_root(state)?;
    let previous = filesystem::read_markdown(&root, relative).unwrap_or_default();
    filesystem::atomic_write_markdown(&root, relative, content)?;
    if *state
        .activity_enabled
        .read()
        .map_err(|_| AppError::State("Aktivite ayarı okunamadı.".to_owned()))?
    {
        crate::activity::record(
            &root,
            &relative.to_string_lossy().replace('\\', "/"),
            "modified",
            previous.split_whitespace().count(),
            content.split_whitespace().count(),
        )?;
    }
    Ok(())
}

pub fn create_file(state: &AppState, relative: &Path, content: &str) -> AppResult<()> {
    let root = current_root(state)?;
    filesystem::create_markdown(&root, relative, content)?;
    if *state
        .activity_enabled
        .read()
        .map_err(|_| AppError::State("Aktivite ayarı okunamadı.".to_owned()))?
    {
        crate::activity::record(
            &root,
            &relative.to_string_lossy().replace('\\', "/"),
            "created",
            0,
            content.split_whitespace().count(),
        )?;
    }
    Ok(())
}

pub fn create_folder(state: &AppState, relative: &Path) -> AppResult<()> {
    filesystem::create_directory(&current_root(state)?, relative)
}

pub fn move_item(state: &AppState, source: &Path, destination: &Path) -> AppResult<()> {
    filesystem::move_entry(&current_root(state)?, source, destination)
}

pub fn delete_item(state: &AppState, relative: &Path) -> AppResult<()> {
    filesystem::trash_entry(&current_root(state)?, relative)
}
