use std::{path::PathBuf, sync::RwLock};

pub struct AppState {
    pub workspace: RwLock<Option<PathBuf>>,
    pub activity_enabled: RwLock<bool>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            workspace: RwLock::new(None),
            activity_enabled: RwLock::new(true),
        }
    }
}
