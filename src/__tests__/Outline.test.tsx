import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Outline from "../components/Outline";
import { TreeNode } from "../tauriClient";

describe("Outline", () => {
  it("renders empty state when no nodes", () => {
    render(<Outline nodes={[]} />);
    expect(screen.getByText("No content")).toBeInTheDocument();
  });

  it("renders nodes with correct text", () => {
    const nodes: TreeNode[] = [
      {
        id: 1,
        depth: 0,
        text: "Project A",
        tags: [],
        parent_id: null,
        children_ids: [2],
      },
      {
        id: 2,
        depth: 1,
        text: "Task 1",
        tags: [],
        parent_id: 1,
        children_ids: [],
      },
    ];

    render(<Outline nodes={nodes} />);
    expect(screen.getByText("Project A")).toBeInTheDocument();
    expect(screen.getByText("Task 1")).toBeInTheDocument();
  });

  it("renders tags with hash prefix", () => {
    const nodes: TreeNode[] = [
      {
        id: 1,
        depth: 0,
        text: "Project A #decision",
        tags: ["decision"],
        parent_id: null,
        children_ids: [],
      },
    ];

    render(<Outline nodes={nodes} />);
    expect(screen.getByText("#decision")).toBeInTheDocument();
  });

  it("applies correct indentation based on depth", () => {
    const nodes: TreeNode[] = [
      {
        id: 1,
        depth: 0,
        text: "Level 0",
        tags: [],
        parent_id: null,
        children_ids: [],
      },
      {
        id: 2,
        depth: 2,
        text: "Level 2",
        tags: [],
        parent_id: null,
        children_ids: [],
      },
    ];

    const { container } = render(<Outline nodes={nodes} />);
    const nodes_els = container.querySelectorAll(".node");
    expect(nodes_els[0]).toHaveStyle("paddingLeft: 0em");
    expect(nodes_els[1]).toHaveStyle("paddingLeft: 3em");
  });

  it("displays multiple tags on a node", () => {
    const nodes: TreeNode[] = [
      {
        id: 1,
        depth: 0,
        text: "Item with tags #decision #ci",
        tags: ["decision", "ci"],
        parent_id: null,
        children_ids: [],
      },
    ];

    render(<Outline nodes={nodes} />);
    expect(screen.getByText("#decision #ci")).toBeInTheDocument();
  });
});
