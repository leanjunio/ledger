import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock appState so that AppShell starts with the results panel visible.
vi.mock("../appState", () => {
  const initialAppState = {
    rootPath: null,
    filePaths: [],
    selectedPath: null,
    editorContent: "",
    outlineNodes: [],
    queryResults: [],
    searchResults: [],
    resultsTitle: "Results",
    resultsVisible: true,
  };

  function appReducer(state: typeof initialAppState, action: any) {
    switch (action.type) {
      case "LOAD_VAULT":
        return {
          ...state,
          rootPath: action.payload.rootPath,
          filePaths: action.payload.filePaths,
          selectedPath: null,
          editorContent: "",
          outlineNodes: [],
        };
      case "SET_FILE_PATHS":
        return {
          ...state,
          filePaths: action.payload,
        };
      case "SELECT_FILE":
        return {
          ...state,
          selectedPath: action.payload.path,
          editorContent: action.payload.content,
        };
      case "SET_EDITOR_CONTENT":
        return {
          ...state,
          editorContent: action.payload,
        };
      case "SET_OUTLINE_NODES":
        return {
          ...state,
          outlineNodes: action.payload,
        };
      case "SET_QUERY_RESULTS":
        return {
          ...state,
          queryResults: action.payload,
        };
      case "SET_SEARCH_RESULTS":
        return {
          ...state,
          searchResults: action.payload,
        };
      case "SHOW_RESULTS":
        return {
          ...state,
          resultsTitle: action.payload.title,
          queryResults: action.payload.queryResults ?? state.queryResults,
          searchResults: action.payload.searchResults ?? state.searchResults,
          resultsVisible: true,
        };
      case "HIDE_RESULTS":
        return {
          ...state,
          resultsVisible: false,
        };
      case "CLEAR_SELECTION":
        return {
          ...state,
          selectedPath: null,
          editorContent: "",
          outlineNodes: [],
        };
      case "CLEAR_EDITOR":
        return {
          ...state,
          editorContent: "",
          outlineNodes: [],
        };
      default:
        return state;
    }
  }

  return {
    initialAppState,
    appReducer,
  };
});

// Mock tauriClient used by AppShell, Editor, FileTree, and SearchAndQueryPanel.
vi.mock("../tauriClient", () => {
  return {
    getSession: vi.fn().mockResolvedValue({}),
    openVault: vi.fn().mockResolvedValue({
      root_path: "/vault",
      file_paths: [],
    }),
    listFiles: vi.fn().mockResolvedValue([]),
    readFile: vi.fn(),
    writeFile: vi.fn().mockResolvedValue(undefined),
    saveSession: vi.fn().mockResolvedValue(undefined),
    parseFile: vi.fn().mockResolvedValue({ nodes: [] }),
    deleteFile: vi.fn().mockResolvedValue(undefined),
    createFile: vi.fn().mockResolvedValue(undefined),
    selectFolder: vi.fn().mockResolvedValue(null),
    queryByTag: vi.fn().mockResolvedValue([]),
    searchFullText: vi.fn(),
  };
});

import AppShell from "../components/AppShell";
import * as tauriClient from "../tauriClient";

describe("AppShell full-text search flow", () => {
  it("runs full-text search and navigates to a result", async () => {
    const user = userEvent.setup();

    (tauriClient.searchFullText as unknown as vi.Mock).mockResolvedValue([
      {
        file_path: "note1.md",
        snippet_or_line: "This is the matching line",
        start_offset: 0,
        end_offset: 4,
      },
    ]);

    (tauriClient.readFile as unknown as vi.Mock).mockResolvedValue(
      "# Loaded from search"
    );

    render(<AppShell />);

    const searchInput = await screen.findByPlaceholderText("e.g. search term");
    await user.type(searchInput, "matching");

    await user.click(
      screen.getByRole("button", {
        name: "Search",
      })
    );

    expect(tauriClient.searchFullText).toHaveBeenCalledWith(
      "matching",
      undefined,
      false
    );

    const resultItem = await screen.findByText(
      /note1.md: This is the matching line/
    );
    await user.click(resultItem);

    expect(tauriClient.readFile).toHaveBeenCalledWith("note1.md");

    await waitFor(() => {
      expect(
        screen.queryByText("Full-text Search:")
      ).toBeNull();
    });

    const editor = await screen.findByPlaceholderText("Markdown content...");
    expect((editor as HTMLTextAreaElement).value).toBe("# Loaded from search");
  });
});

