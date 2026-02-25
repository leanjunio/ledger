import { TreeNode, QueryResultItem, SearchMatch } from "./tauriClient";

/**
 * AppState mirrors the existing state shape from src/main.ts.
 */
export type AppState = {
  rootPath: string | null;
  filePaths: string[];
  selectedPath: string | null;
  editorContent: string;
  outlineNodes: TreeNode[];
  queryResults: QueryResultItem[];
  searchResults: SearchMatch[];
  resultsTitle: string;
  resultsVisible: boolean;
};

export const initialAppState: AppState = {
  rootPath: null,
  filePaths: [],
  selectedPath: null,
  editorContent: "",
  outlineNodes: [],
  queryResults: [],
  searchResults: [],
  resultsTitle: "",
  resultsVisible: false,
};

/**
 * AppAction union covers all state transitions.
 */
export type AppAction =
  | { type: "LOAD_VAULT"; payload: { rootPath: string; filePaths: string[] } }
  | { type: "SET_FILE_PATHS"; payload: string[] }
  | { type: "SELECT_FILE"; payload: { path: string; content: string } }
  | { type: "SET_EDITOR_CONTENT"; payload: string }
  | { type: "SET_OUTLINE_NODES"; payload: TreeNode[] }
  | { type: "SET_QUERY_RESULTS"; payload: QueryResultItem[] }
  | { type: "SET_SEARCH_RESULTS"; payload: SearchMatch[] }
  | {
      type: "SHOW_RESULTS";
      payload: { title: string; queryResults?: QueryResultItem[]; searchResults?: SearchMatch[] };
    }
  | { type: "HIDE_RESULTS" }
  | { type: "CLEAR_SELECTION" }
  | { type: "CLEAR_EDITOR" };

/**
 * Reducer implements all state transitions.
 */
export function appReducer(state: AppState, action: AppAction): AppState {
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
