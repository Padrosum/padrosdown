use crate::{errors::AppResult, filesystem};
use serde::Serialize;
use std::{fs, path::Path};

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SearchResult {
    pub file_name: String,
    pub path: String,
    pub snippet: String,
    pub match_count: usize,
    pub line: usize,
}

pub fn search(root: &Path, query: &str) -> AppResult<Vec<SearchResult>> {
    let normalized = query.trim().to_lowercase();
    if normalized.is_empty() {
        return Ok(Vec::new());
    }
    let mut results = Vec::new();
    for path in filesystem::collect_markdown_paths(root)? {
        let relative = path
            .strip_prefix(root)
            .unwrap_or(&path)
            .to_string_lossy()
            .replace('\\', "/");
        let file_name = path
            .file_name()
            .map(|name| name.to_string_lossy().into_owned())
            .unwrap_or_default();
        let content = match fs::read_to_string(&path) {
            Ok(content) => content,
            Err(_) => continue,
        };
        let name_matches = file_name.to_lowercase().matches(&normalized).count();
        let content_lower = content.to_lowercase();
        let content_matches = content_lower.matches(&normalized).count();
        let match_count = name_matches + content_matches;
        if match_count == 0 {
            continue;
        }
        let (line, snippet) = content
            .lines()
            .enumerate()
            .find(|(_, value)| value.to_lowercase().contains(&normalized))
            .map(|(index, value)| (index + 1, value.trim().chars().take(180).collect()))
            .unwrap_or((1, "Dosya adında eşleşme".to_owned()));
        results.push(SearchResult {
            file_name,
            path: relative,
            snippet,
            match_count,
            line,
        });
    }
    results.sort_by(|left, right| {
        right
            .match_count
            .cmp(&left.match_count)
            .then_with(|| left.path.cmp(&right.path))
    });
    Ok(results)
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn searches_file_names_and_utf8_markdown_content() -> Result<(), Box<dyn std::error::Error>> {
        let root = tempdir()?;
        fs::write(
            root.path().join("alpha.md"),
            "Birinci satır\nAranan kavram burada",
        )?;
        fs::write(root.path().join("binary.md"), [0xff, 0xfe])?;
        fs::write(root.path().join("ignored.txt"), "aranan")?;
        let results = search(root.path(), "aranan")?;
        assert_eq!(results.len(), 1);
        assert_eq!(results[0].line, 2);
        Ok(())
    }
}
