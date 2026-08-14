mod activity;
mod commands;
mod errors;
mod filesystem;
mod models;
mod search;
mod services;
mod state;

use state::AppState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(AppState::default())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .invoke_handler(tauri::generate_handler![
            commands::set_workspace,
            commands::list_workspace_files,
            commands::read_markdown_file,
            commands::write_markdown_file,
            commands::create_markdown_file,
            commands::create_folder,
            commands::move_workspace_entry,
            commands::trash_workspace_entry,
            commands::search_workspace,
            commands::activity_summary,
            commands::set_activity_tracking,
        ])
        .run(tauri::generate_context!())
        .unwrap_or_else(|error| eprintln!("padrosdown başlatılamadı: {error}"));
}
