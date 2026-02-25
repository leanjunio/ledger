//! Parse markdown list items into a tree of nodes (depth, text, tags, parent/child).
//! Uses pulldown-cmark; list nesting gives depth. Tags: `#[\w-]+` in list item text.

use pulldown_cmark::{Event, Parser, Tag};
use regex::Regex;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct TreeNode {
    pub id: usize,
    pub depth: u32,
    pub text: String,
    pub tags: Vec<String>,
    pub parent_id: Option<usize>,
    #[serde(rename = "children_ids")]
    pub children_ids: Vec<usize>,
}

/// Extract tag names from text (pattern #[\w-]+), without the #.
fn extract_tags(text: &str) -> Vec<String> {
    let re = Regex::new(r#"#([\w-]+)"#).unwrap();
    re.captures_iter(text)
        .filter_map(|c| c.get(1))
        .map(|m| m.as_str().to_string())
        .collect()
}

/// Parse markdown content into tree nodes. Depth from list nesting in the parser.
pub fn parse_list_items(content: &str) -> Vec<TreeNode> {
    let mut nodes: Vec<TreeNode> = Vec::new();
    let mut stack: Vec<usize> = Vec::new(); // parent chain by depth
    let mut list_depth: u32 = 0;
    let mut current_text = String::new();

    let parser = Parser::new(content);

    for event in parser {
        match event {
            Event::Start(Tag::List(_)) => {
                list_depth = list_depth.saturating_add(1);
            }
            Event::End(Tag::List(_)) => {
                list_depth = list_depth.saturating_sub(1);
            }
            Event::Start(Tag::Item) => {
                current_text.clear();
            }
            Event::End(Tag::Item) => {
                let text = current_text.trim().to_string();
                if text.is_empty() {
                    continue;
                }
                let tags = extract_tags(&text);
                let depth = list_depth.saturating_sub(1); // depth 0 = top-level list
                while stack.len() > depth as usize {
                    stack.pop();
                }
                let parent_id = stack.last().copied();
                let id = nodes.len();
                if let Some(&pid) = stack.last() {
                    if let Some(p) = nodes.get_mut(pid) {
                        p.children_ids.push(id);
                    }
                }
                stack.push(id);
                nodes.push(TreeNode {
                    id,
                    depth,
                    text,
                    tags,
                    parent_id,
                    children_ids: Vec::new(),
                });
                current_text.clear();
            }
            Event::Text(t) => {
                current_text.push_str(&t.to_string());
            }
            Event::SoftBreak => {
                current_text.push(' ');
            }
            Event::HardBreak => {
                current_text.push('\n');
            }
            _ => {}
        }
    }

    nodes
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_two_root_one_child() {
        // Nested list: first item contains a sublist
        let content = "- a\n  - b";
        let nodes = parse_list_items(content);
        assert_eq!(nodes.len(), 2, "expected 2 nodes");
        assert_eq!(nodes[0].depth, 0);
        assert_eq!(nodes[0].parent_id, None);
        assert!(nodes[0].text.contains("a"));
        assert_eq!(nodes[1].depth, 1);
        assert_eq!(nodes[1].parent_id, Some(0));
        assert!(nodes[1].text.contains("b"));
        assert_eq!(nodes[0].children_ids, vec![1]);
    }

    #[test]
    fn parse_tags_decision_ci() {
        let content = "- Do it #decision #ci";
        let nodes = parse_list_items(content);
        assert_eq!(nodes.len(), 1);
        assert!(nodes[0].tags.contains(&"decision".to_string()));
        assert!(nodes[0].tags.contains(&"ci".to_string()));
    }
}
