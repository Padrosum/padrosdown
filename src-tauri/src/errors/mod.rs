use serde::Serialize;
use std::{fmt, io};

#[derive(Debug, Serialize)]
#[serde(tag = "kind", content = "message", rename_all = "snake_case")]
pub enum AppError {
    WorkspaceNotSelected(String),
    InvalidWorkspace(String),
    InvalidPath(String),
    UnsupportedFile(String),
    NotFound(String),
    Io(String),
    State(String),
}

impl AppError {
    pub fn io(context: &str, error: io::Error) -> Self {
        Self::Io(format!("{context}: {error}"))
    }
}

impl fmt::Display for AppError {
    fn fmt(&self, formatter: &mut fmt::Formatter<'_>) -> fmt::Result {
        let message = match self {
            Self::WorkspaceNotSelected(message)
            | Self::InvalidWorkspace(message)
            | Self::InvalidPath(message)
            | Self::UnsupportedFile(message)
            | Self::NotFound(message)
            | Self::Io(message)
            | Self::State(message) => message,
        };
        write!(formatter, "{message}")
    }
}

impl std::error::Error for AppError {}

pub type AppResult<T> = Result<T, AppError>;
