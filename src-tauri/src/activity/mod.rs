use crate::errors::{AppError, AppResult};
use serde::{Deserialize, Serialize};
use std::{
    collections::BTreeMap,
    fs,
    path::Path,
    time::{SystemTime, UNIX_EPOCH},
};

const SESSION_MILLIS: u64 = 5 * 60 * 1000;
const WEEK_MILLIS: u64 = 7 * 24 * 60 * 60 * 1000;

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct ActivityRecord {
    pub path: String,
    pub timestamp: u64,
    pub operation: String,
    pub previous_word_count: usize,
    pub new_word_count: usize,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RankedFile {
    pub path: String,
    pub edits: usize,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DayActivity {
    pub day: String,
    pub edits: usize,
    pub words_added: isize,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ActivitySummary {
    pub created_files: usize,
    pub edited_files: usize,
    pub total_words_added: isize,
    pub recent_files: Vec<String>,
    pub most_edited: Vec<RankedFile>,
    pub days: Vec<DayActivity>,
}

fn now_millis() -> AppResult<u64> {
    let value = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|_| AppError::State("Sistem saati geçersiz.".to_owned()))?
        .as_millis();
    u64::try_from(value).map_err(|_| AppError::State("Zaman değeri desteklenmiyor.".to_owned()))
}

fn activity_path(root: &Path) -> std::path::PathBuf {
    root.join(".hypomnema").join("activity.json")
}

pub fn load(root: &Path) -> AppResult<Vec<ActivityRecord>> {
    let path = activity_path(root);
    if !path.exists() {
        return Ok(Vec::new());
    }
    let content = fs::read_to_string(path)
        .map_err(|error| AppError::io("Aktivite kaydı okunamadı", error))?;
    serde_json::from_str(&content)
        .map_err(|error| AppError::Io(format!("Aktivite kaydı çözümlenemedi: {error}")))
}

fn save(root: &Path, records: &[ActivityRecord]) -> AppResult<()> {
    let directory = root.join(".hypomnema");
    fs::create_dir_all(&directory)
        .map_err(|error| AppError::io("Aktivite klasörü oluşturulamadı", error))?;
    let destination = activity_path(root);
    let temporary = directory.join("activity.json.tmp");
    let json = serde_json::to_vec_pretty(records)
        .map_err(|error| AppError::Io(format!("Aktivite kaydı oluşturulamadı: {error}")))?;
    fs::write(&temporary, json)
        .map_err(|error| AppError::io("Aktivite kaydı yazılamadı", error))?;
    fs::rename(temporary, destination)
        .map_err(|error| AppError::io("Aktivite kaydı değiştirilemedi", error))
}

pub fn record(
    root: &Path,
    path: &str,
    operation: &str,
    previous: usize,
    new: usize,
) -> AppResult<()> {
    let timestamp = now_millis()?;
    let mut records = load(root)?;
    if let Some(last) = records.last_mut().filter(|last| {
        last.path == path
            && last.operation == operation
            && timestamp.saturating_sub(last.timestamp) <= SESSION_MILLIS
    }) {
        last.timestamp = timestamp;
        last.new_word_count = new;
    } else {
        records.push(ActivityRecord {
            path: path.to_owned(),
            timestamp,
            operation: operation.to_owned(),
            previous_word_count: previous,
            new_word_count: new,
        });
    }
    save(root, &records)
}

pub fn summary(root: &Path) -> AppResult<ActivitySummary> {
    let cutoff = now_millis()?.saturating_sub(WEEK_MILLIS);
    let mut records: Vec<_> = load(root)?
        .into_iter()
        .filter(|record| record.timestamp >= cutoff)
        .collect();
    records.sort_by_key(|record| record.timestamp);
    let created_files = records
        .iter()
        .filter(|record| record.operation == "created")
        .map(|record| &record.path)
        .collect::<std::collections::HashSet<_>>()
        .len();
    let edited_files = records
        .iter()
        .filter(|record| record.operation == "modified")
        .map(|record| &record.path)
        .collect::<std::collections::HashSet<_>>()
        .len();
    let total_words_added = records
        .iter()
        .map(|record| record.new_word_count as isize - record.previous_word_count as isize)
        .sum();
    let mut counts = BTreeMap::<String, usize>::new();
    for record in &records {
        *counts.entry(record.path.clone()).or_default() += 1;
    }
    let mut most_edited: Vec<_> = counts
        .into_iter()
        .map(|(path, edits)| RankedFile { path, edits })
        .collect();
    most_edited.sort_by_key(|item| std::cmp::Reverse(item.edits));
    most_edited.truncate(8);
    let mut recent_files = Vec::new();
    for record in records.iter().rev() {
        if !recent_files.contains(&record.path) {
            recent_files.push(record.path.clone());
        }
    }
    recent_files.truncate(8);
    let mut day_map = BTreeMap::<String, (usize, isize)>::new();
    for record in &records {
        let day = (record.timestamp / 86_400_000).to_string();
        let entry = day_map.entry(day).or_default();
        entry.0 += 1;
        entry.1 += record.new_word_count as isize - record.previous_word_count as isize;
    }
    let days = day_map
        .into_iter()
        .map(|(day, (edits, words_added))| DayActivity {
            day,
            edits,
            words_added,
        })
        .collect();
    Ok(ActivitySummary {
        created_files,
        edited_files,
        total_words_added,
        recent_files,
        most_edited,
        days,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn groups_consecutive_autosaves_for_same_file() -> Result<(), Box<dyn std::error::Error>> {
        let root = tempdir()?;
        record(root.path(), "a.md", "modified", 10, 12)?;
        record(root.path(), "a.md", "modified", 10, 15)?;
        let records = load(root.path())?;
        assert_eq!(records.len(), 1);
        assert_eq!(records[0].new_word_count, 15);
        Ok(())
    }
}
