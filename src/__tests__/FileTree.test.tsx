import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FileTree from "../components/FileTree";
import { AppContext } from "../components/AppShell";
import { initialAppState } from "../appState";

// Mock tauriClient
vi.mock("../tauriClient", () => ({
  selectFolder: vi.fn(),
}));

const mockContextValue = {
  state: initialAppState,
  dispatch: vi.fn(),
};

describe("FileTree", () => {
  it("renders file list and displays files", () => {
    render(
      <AppContext.Provider value={mockContextValue}>
        <FileTree
          filePaths={["note1.md", "note2.md"]}
          selectedPath="note1.md"
          onSelectFile={vi.fn()}
          onOpenVault={vi.fn()}
          onRefreshList={vi.fn()}
        />
      </AppContext.Provider>
    );

    expect(screen.getByText("note1.md")).toBeInTheDocument();
    expect(screen.getByText("note2.md")).toBeInTheDocument();
  });

  it("highlights selected file", () => {
    render(
      <AppContext.Provider value={mockContextValue}>
        <FileTree
          filePaths={["note1.md", "note2.md"]}
          selectedPath="note1.md"
          onSelectFile={vi.fn()}
          onOpenVault={vi.fn()}
          onRefreshList={vi.fn()}
        />
      </AppContext.Provider>
    );

    const link = screen.getByText("note1.md");
    expect(link).toHaveClass("selected");
  });

  it("calls onSelectFile when a file is clicked", async () => {
    const mockSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <AppContext.Provider value={mockContextValue}>
        <FileTree
          filePaths={["note1.md", "note2.md"]}
          selectedPath={null}
          onSelectFile={mockSelect}
          onOpenVault={vi.fn()}
          onRefreshList={vi.fn()}
        />
      </AppContext.Provider>
    );

    await user.click(screen.getByText("note1.md"));
    expect(mockSelect).toHaveBeenCalledWith("note1.md");
  });

  it("shows empty state when no files", () => {
    render(
      <AppContext.Provider value={mockContextValue}>
        <FileTree
          filePaths={[]}
          selectedPath={null}
          onSelectFile={vi.fn()}
          onOpenVault={vi.fn()}
          onRefreshList={vi.fn()}
        />
      </AppContext.Provider>
    );

    expect(screen.getByText("No .md files")).toBeInTheDocument();
  });

  it("renders file tree header with buttons", () => {
    render(
      <AppContext.Provider value={mockContextValue}>
        <FileTree
          filePaths={[]}
          selectedPath={null}
          onSelectFile={vi.fn()}
          onOpenVault={vi.fn()}
          onRefreshList={vi.fn()}
        />
      </AppContext.Provider>
    );

    expect(screen.getByText("Files")).toBeInTheDocument();
    expect(screen.getByTitle("Open vault")).toBeInTheDocument();
    expect(screen.getByTitle("Create file")).toBeInTheDocument();
  });
});
