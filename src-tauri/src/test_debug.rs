use crate::markdown::parse_list_items;

#[test]
fn debug_parse() {
    let content = "- a\n  - b";
    let nodes = parse_list_items(content);
    eprintln!("Number of nodes: {}", nodes.len());
    for node in &nodes {
        eprintln!("Node: id={}, depth={}, text='{}', parent_id={:?}, children={:?}", 
            node.id, node.depth, node.text, node.parent_id, node.children_ids);
    }
    panic!("Debug output above");
}
