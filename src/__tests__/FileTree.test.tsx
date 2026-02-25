import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FileTree from "../components/FileTree";
import { AppContext } from "../components/AppShell";
import { initialAppState } from "../appState";

vi.mock("../tauriClient", () => ({
  selectFolder: vi.fn(),
  createFile: vi.fn(),
  deleteFile: vi.fn(),
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
          filePaths={["vault/note1.md", "vault/note2.md"]}
          selectedPath="vault/note1.md"
          onSelectFile={vi.fn().mockResolvedValue(undefined)}
          onOpenVault={vi.fn().mockResolvedValue(undefined)}
          onRefreshList={vi.fn().mockResolvedValue(undefined)}
        />
      </AppContext.Provider>
    );

    expect(screen.getByText("note1.md")).toBeInTheDocument();
    expect(screen.getByText("note2.md")).toBeInTheDocument();
  });

  it("highlights the selected file", () => {
    render(
      <AppContext.Provider value={mockContextValue}>
        <FileTree
          filePaths={["vault/note1.md", "vault/note2.md"]}
          selectedPath="vault/note2.md"
          onSelectFile={vi.fn().mockResolvedValue(undefined)}
          onOpenVault={vi.fn().mockResolvedValue(undefined)}
          onRefreshList={vi.fn().mockResolvedValue(undefined)}
        />
      </AppContext.Provider>
    );

    const link = screen.getByText("note2.md");
    expect(link).toHaveClass("selected");
  });

  it("calls onSelectFile when a file is clicked", async () => {
    const user = userEvent.setup();
    const onSelectFile = vi.fn().mockResolvedValue(undefined);

    render(
      <AppContext.Provider value={mockContextValue}>
        <FileTree
          filePaths={["vault/note1.md", "vault/note2.md"]}
          selectedPath={null}
          onSelectFile={onSelectFile}
          onOpenVault={vi.fn().mockResolvedValue(undefined)}
          onRefreshList={vi.fn().mockResolvedValue(undefined)}
        />
      </AppContext.Provider>
    );

    await user.click(screen.getByText("note1.md"));
    expect(onSelectFile).toHaveBeenCalledWith("vault/note1.md");
  });

  it("shows empty state when no files", () => {
    render(
      <AppContext.Provider value={mockContextValue}>
        <FileTree
          filePaths={[]}
          selectedPath={null}
          onSelectFile={vi.fn().mockResolvedValue(undefined)}
          onOpenVault={vi.fn().mockResolvedValue(undefined)}
          onRefreshList={vi.fn().mockResolvedValue(undefined)}
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
          onSelectFile={vi.fn().mockResolvedValue(undefined)}
          onOpenVault={vi.fn().mockResolvedValue(undefined)}
          onRefreshList={vi.fn().mockResolvedValue(undefined)}
        />
      </AppContext.Provider>
    );

    expect(screen.getByText("Files")).toBeInTheDocument();
    expect(screen.getByTitle("Open vault")).toBeInTheDocument();
    expect(screen.getByTitle("Create file")).toBeInTheDocument();
  });
});

