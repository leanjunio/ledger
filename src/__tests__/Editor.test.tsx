import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Editor from "../components/Editor";
import { AppContext } from "../components/AppShell";
import { initialAppState } from "../appState";

// Mock tauriClient
vi.mock("../tauriClient");

const mockContextValue = {
  state: initialAppState,
  dispatch: vi.fn(),
};

describe("Editor", () => {
  it("shows placeholder when no file is selected", () => {
    render(
      <AppContext.Provider value={mockContextValue}>
        <Editor
          selectedPath={null}
          content=""
          onContentChange={vi.fn()}
          onSave={vi.fn()}
        />
      </AppContext.Provider>
    );

    expect(
      screen.getByText("Select a file or open a vault to get started.")
    ).toBeInTheDocument();
  });

  it("renders textarea with content when file is selected", () => {
    render(
      <AppContext.Provider value={mockContextValue}>
        <Editor
          selectedPath="note.md"
          content="# My Note"
          onContentChange={vi.fn()}
          onSave={vi.fn()}
        />
      </AppContext.Provider>
    );

    const textarea = screen.getByPlaceholderText("Markdown content...") as HTMLTextAreaElement;
    expect(textarea.value).toBe("# My Note");
  });

  it("calls onContentChange when textarea input changes", async () => {
    const mockChange = vi.fn();
    const user = userEvent.setup();

    render(
      <AppContext.Provider value={mockContextValue}>
        <Editor
          selectedPath="note.md"
          content=""
          onContentChange={mockChange}
          onSave={vi.fn()}
        />
      </AppContext.Provider>
    );

    const textarea = screen.getByPlaceholderText("Markdown content...");
    await user.type(textarea, "New");
    // onChange fires for each character typed
    expect(mockChange).toHaveBeenCalled();
    expect(mockChange.mock.calls.length).toBeGreaterThan(0);
  });

  it("calls onSave when Save button is clicked", async () => {
    const mockSave = vi.fn();
    const user = userEvent.setup();

    render(
      <AppContext.Provider value={mockContextValue}>
        <Editor
          selectedPath="note.md"
          content="# My Note"
          onContentChange={vi.fn()}
          onSave={mockSave}
        />
      </AppContext.Provider>
    );

    await user.click(screen.getByText("Save"));
    expect(mockSave).toHaveBeenCalled();
  });

  it("renders Save and Delete buttons when file is selected", () => {
    render(
      <AppContext.Provider value={mockContextValue}>
        <Editor
          selectedPath="note.md"
          content=""
          onContentChange={vi.fn()}
          onSave={vi.fn()}
        />
      </AppContext.Provider>
    );

    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Delete file")).toBeInTheDocument();
  });
});
