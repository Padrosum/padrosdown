use crate::{errors::AppResult, models::FileNode, services::workspace, state::AppState};
use std::path::Path;
use tauri::State;

#[tauri::command]
pub fn set_workspace(path: String, state: State<'_, AppState>) -> AppResult<String> {
    let canonical = workspace::set_root(&state, Path::new(&path))?;
    Ok(canonical.to_string_lossy().into_owned())
}

#[tauri::command]
pub fn list_workspace_files(state: State<'_, AppState>) -> AppResult<Vec<FileNode>> {
    workspace::list_files(&state)
}

#[tauri::command]
pub fn read_markdown_file(path: String, state: State<'_, AppState>) -> AppResult<String> {
    workspace::read_file(&state, Path::new(&path))
}

#[tauri::command]
pub fn write_markdown_file(
    path: String,
    content: String,
    state: State<'_, AppState>,
) -> AppResult<()> {
    workspace::write_file(&state, Path::new(&path), &content)
}

#[tauri::command]
pub fn create_markdown_file(
    path: String,
    content: String,
    state: State<'_, AppState>,
) -> AppResult<()> {
    workspace::create_file(&state, Path::new(&path), &content)
}

#[tauri::command]
pub fn create_folder(path: String, state: State<'_, AppState>) -> AppResult<()> {
    workspace::create_folder(&state, Path::new(&path))
}

#[tauri::command]
pub fn move_workspace_entry(
    source: String,
    destination: String,
    state: State<'_, AppState>,
) -> AppResult<()> {
    workspace::move_item(&state, Path::new(&source), Path::new(&destination))
}

#[tauri::command]
pub fn trash_workspace_entry(path: String, state: State<'_, AppState>) -> AppResult<()> {
    workspace::delete_item(&state, Path::new(&path))
}

#[tauri::command]
pub async fn search_workspace(
    query: String,
    state: State<'_, AppState>,
) -> AppResult<Vec<crate::search::SearchResult>> {
    let root = workspace::current_root(&state)?;
    tauri::async_runtime::spawn_blocking(move || crate::search::search(&root, &query))
        .await
        .map_err(|error| {
            crate::errors::AppError::State(format!("Arama görevi tamamlanamadı: {error}"))
        })?
}

#[tauri::command]
pub fn activity_summary(state: State<'_, AppState>) -> AppResult<crate::activity::ActivitySummary> {
    crate::activity::summary(&workspace::current_root(&state)?)
}

#[tauri::command]
pub fn set_activity_tracking(enabled: bool, state: State<'_, AppState>) -> AppResult<()> {
    *state.activity_enabled.write().map_err(|_| {
        crate::errors::AppError::State("Aktivite ayarı güncellenemedi.".to_owned())
    })? = enabled;
    Ok(())
}
