import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Editor from "../components/Editor";
import { AppContext } from "../components/AppShell";
import { initialAppState } from "../appState";
import * as tauriClient from "../tauriClient";

// Mock tauriClient
vi.mock("../tauriClient");

const mockContextValue = {
  state: initialAppState,
  dispatch: vi.fn(),
};

describe("Editor", () => {
  beforeEach(() => {
    mockContextValue.dispatch.mockClear();
    vi.clearAllMocks();
  });

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

  it("updates outline nodes when parseFile succeeds after debounce", async () => {
    const nodes = [
      {
        id: "1",
        depth: 0,
        text: "Title",
        tags: [],
        parent_id: null,
        children_ids: [],
      },
    ];

    const parseFileMock = tauriClient.parseFile as unknown as vi.Mock;
    parseFileMock.mockResolvedValue({ nodes });

    render(
      <AppContext.Provider value={mockContextValue}>
        <Editor
          selectedPath="note.md"
          content="# Title"
          onContentChange={vi.fn()}
          onSave={vi.fn()}
        />
      </AppContext.Provider>
    );

    await waitFor(() => {
      expect(parseFileMock).toHaveBeenCalledWith("note.md", "# Title");
      expect(mockContextValue.dispatch).toHaveBeenCalledWith({
        type: "SET_OUTLINE_NODES",
        payload: nodes,
      });
    });
  });

  it("clears outline nodes when parseFile throws", async () => {
    const parseFileMock = tauriClient.parseFile as unknown as vi.Mock;
    parseFileMock.mockRejectedValue(new Error("parse error"));

    render(
      <AppContext.Provider value={mockContextValue}>
        <Editor
          selectedPath="note.md"
          content="# Title"
          onContentChange={vi.fn()}
          onSave={vi.fn()}
        />
      </AppContext.Provider>
    );

    await waitFor(() => {
      expect(parseFileMock).toHaveBeenCalledWith("note.md", "# Title");
      expect(mockContextValue.dispatch).toHaveBeenCalledWith({
        type: "SET_OUTLINE_NODES",
        payload: [],
      });
    });
  });

  it("deletes file and refreshes file list when user confirms", async () => {
    const user = userEvent.setup();
    const deleteFileMock = tauriClient.deleteFile as unknown as vi.Mock;
    const listFilesMock = tauriClient.listFiles as unknown as vi.Mock;
    deleteFileMock.mockResolvedValue(undefined);
    listFilesMock.mockResolvedValue(["notes/todo.md", "notes/ideas.md"]);

    const confirmSpy = vi
      .spyOn(window, "confirm")
      .mockReturnValue(true);
    const alertSpy = vi
      .spyOn(window, "alert")
      .mockImplementation(() => {});

    render(
      <AppContext.Provider value={mockContextValue}>
        <Editor
          selectedPath="notes/todo.md"
          content="Todo list"
          onContentChange={vi.fn()}
          onSave={vi.fn()}
        />
      </AppContext.Provider>
    );

    await user.click(screen.getByText("Delete file"));

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith('Delete "notes/todo.md"?');
      expect(deleteFileMock).toHaveBeenCalledWith("notes/todo.md");
      expect(listFilesMock).toHaveBeenCalled();
      expect(mockContextValue.dispatch).toHaveBeenCalledWith({
        type: "CLEAR_SELECTION",
      });
      expect(mockContextValue.dispatch).toHaveBeenCalledWith({
        type: "SET_FILE_PATHS",
        payload: ["notes/todo.md", "notes/ideas.md"],
      });
      expect(alertSpy).not.toHaveBeenCalled();
    });

    confirmSpy.mockRestore();
    alertSpy.mockRestore();
  });
});
