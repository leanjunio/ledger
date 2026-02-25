import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchAndQueryPanel from "../components/SearchAndQueryPanel";
import { AppContext } from "../components/AppShell";
import { initialAppState } from "../appState";

// Mock tauriClient
vi.mock("../tauriClient");

const mockContextValue = {
  state: initialAppState,
  dispatch: vi.fn(),
};

describe("SearchAndQueryPanel", () => {
  it("renders with title and controls", () => {
    render(
      <AppContext.Provider value={mockContextValue}>
        <SearchAndQueryPanel
          title="Query: #decision"
          queryResults={[]}
          searchResults={[]}
          onResultSelect={vi.fn()}
          onClose={vi.fn()}
        />
      </AppContext.Provider>
    );

    expect(screen.getByText("Query: #decision")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. decision")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. search term")).toBeInTheDocument();
  });

  it("shows empty state when no results", () => {
    render(
      <AppContext.Provider value={mockContextValue}>
        <SearchAndQueryPanel
          title="Query: #decision"
          queryResults={[]}
          searchResults={[]}
          onResultSelect={vi.fn()}
          onClose={vi.fn()}
        />
      </AppContext.Provider>
    );

    expect(screen.getByText("No results")).toBeInTheDocument();
  });

  it("renders query results", () => {
    const queryResults = [
      {
        file_path: "note1.md",
        parent_path: "Project A > Task 1",
        node: {
          id: 1,
          depth: 2,
          text: "Decision #decision",
          tags: ["decision"],
          parent_id: null,
          children_ids: [],
        },
      },
    ];

    render(
      <AppContext.Provider value={mockContextValue}>
        <SearchAndQueryPanel
          title="Query: #decision"
          queryResults={queryResults}
          searchResults={[]}
          onResultSelect={vi.fn()}
          onClose={vi.fn()}
        />
      </AppContext.Provider>
    );

    expect(screen.getByText(/note1.md.*Project A > Task 1.*Decision/)).toBeInTheDocument();
  });

  it("renders search results", () => {
    const searchResults = [
      {
        file_path: "note1.md",
        snippet_or_line: "This is the matching line",
        start_offset: 0,
        end_offset: 4,
      },
    ];

    render(
      <AppContext.Provider value={mockContextValue}>
        <SearchAndQueryPanel
          title="Search: matching"
          queryResults={[]}
          searchResults={searchResults}
          onResultSelect={vi.fn()}
          onClose={vi.fn()}
        />
      </AppContext.Provider>
    );

    expect(screen.getByText(/note1.md.*This is the matching line/)).toBeInTheDocument();
  });

  it("calls onResultSelect when a result is clicked", async () => {
    const mockSelect = vi.fn();
    const user = userEvent.setup();
    const queryResults = [
      {
        file_path: "note1.md",
        parent_path: null,
        node: {
          id: 1,
          depth: 0,
          text: "Decision #decision",
          tags: ["decision"],
          parent_id: null,
          children_ids: [],
        },
      },
    ];

    render(
      <AppContext.Provider value={mockContextValue}>
        <SearchAndQueryPanel
          title="Query: #decision"
          queryResults={queryResults}
          searchResults={[]}
          onResultSelect={mockSelect}
          onClose={vi.fn()}
        />
      </AppContext.Provider>
    );

    const resultItem = screen.getByText(/note1.md.*Decision/);
    await user.click(resultItem);
    expect(mockSelect).toHaveBeenCalledWith("note1.md");
  });

  it("calls onClose when close button is clicked", async () => {
    const mockClose = vi.fn();
    const user = userEvent.setup();

    render(
      <AppContext.Provider value={mockContextValue}>
        <SearchAndQueryPanel
          title="Query: #decision"
          queryResults={[]}
          searchResults={[]}
          onResultSelect={vi.fn()}
          onClose={mockClose}
        />
      </AppContext.Provider>
    );

    await user.click(screen.getByRole("button", { name: "✕" }));
    expect(mockClose).toHaveBeenCalled();
  });

  it("renders both query and search inputs", () => {
    render(
      <AppContext.Provider value={mockContextValue}>
        <SearchAndQueryPanel
          title="Results"
          queryResults={[]}
          searchResults={[]}
          onResultSelect={vi.fn()}
          onClose={vi.fn()}
        />
      </AppContext.Provider>
    );

    expect(screen.getByText("Tag Query:")).toBeInTheDocument();
    expect(screen.getByText("Full-text Search:")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Query|Search/ }).length).toBeGreaterThan(0);
  });
});
