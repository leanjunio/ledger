import React, { useReducer, useEffect } from "react";
import { appReducer, initialAppState, AppState, AppAction } from "../appState";
import * as tauriClient from "../tauriClient";
import FileTree from "./FileTree";
import Editor from "./Editor";
import Outline from "./Outline";
import SearchAndQueryPanel from "./SearchAndQueryPanel";
import "../styles.css";

type AppContextType = {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
};

export const AppContext = React.createContext<AppContextType | undefined>(
  undefined
);

export function useAppState() {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error("useAppState must be used within AppShell");
  }
  return context;
}

const AppShell: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, initialAppState);

  // Load session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const session = await tauriClient.getSession();
        if (session.last_vault_path) {
          try {
            const vaultInfo = await tauriClient.openVault(session.last_vault_path);
            dispatch({
              type: "LOAD_VAULT",
              payload: {
                rootPath: vaultInfo.root_path,
                filePaths: vaultInfo.file_paths,
              },
            });
            if (
              session.last_file_path &&
              vaultInfo.file_paths.includes(session.last_file_path)
            ) {
              try {
                const content = await tauriClient.readFile(
                  session.last_file_path
                );
                dispatch({
                  type: "SELECT_FILE",
                  payload: {
                    path: session.last_file_path,
                    content: content ?? "",
                  },
                });
              } catch {
                // File not readable
              }
            }
          } catch {
            // Vault path invalid
          }
        }
      } catch {
        // No session
      }
    };

    loadSession();
  }, []);

  // Keyboard shortcut: Ctrl/Cmd+S to save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "s" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (state.selectedPath) {
          saveFile();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state.selectedPath, state.editorContent]);

  const saveFile = async () => {
    if (!state.selectedPath) return;
    try {
      await tauriClient.writeFile(state.selectedPath, state.editorContent);
    } catch (err) {
      console.error(err);
      alert(String(err));
    }
  };

  const handleFileTreeRefresh = async () => {
    try {
      const paths = await tauriClient.listFiles();
      dispatch({ type: "SET_FILE_PATHS", payload: paths ?? [] });
    } catch {
      dispatch({ type: "SET_FILE_PATHS", payload: [] });
    }
  };

  const handleSelectFile = async (path: string) => {
    try {
      const content = await tauriClient.readFile(path);
      dispatch({
        type: "SELECT_FILE",
        payload: { path, content: content ?? "" },
      });
      await tauriClient.saveSession({ last_file_path: path });
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenVault = async (path: string) => {
    try {
      const result = await tauriClient.openVault(path);
      dispatch({
        type: "LOAD_VAULT",
        payload: {
          rootPath: result.root_path,
          filePaths: result.file_paths,
        },
      });
      await tauriClient.saveSession({ last_vault_path: result.root_path });
    } catch (err) {
      console.error(err);
      alert(String(err));
    }
  };

  const handleResultSelect = async (filePath: string) => {
    await handleSelectFile(filePath);
    dispatch({ type: "HIDE_RESULTS" });
  };

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <div className="app-shell">
        <div className="sidebar">
          <FileTree
            filePaths={state.filePaths}
            selectedPath={state.selectedPath}
            onSelectFile={handleSelectFile}
            onOpenVault={handleOpenVault}
            onRefreshList={handleFileTreeRefresh}
          />
          <Outline nodes={state.outlineNodes} />
        </div>
        <div className="main-content">
          <Editor
            selectedPath={state.selectedPath}
            content={state.editorContent}
            onContentChange={(content) =>
              dispatch({ type: "SET_EDITOR_CONTENT", payload: content })
            }
            onSave={saveFile}
          />
          {state.resultsVisible && (
            <SearchAndQueryPanel
              title={state.resultsTitle}
              queryResults={state.queryResults}
              searchResults={state.searchResults}
              onResultSelect={handleResultSelect}
              onClose={() => dispatch({ type: "HIDE_RESULTS" })}
            />
          )}
        </div>
      </div>
    </AppContext.Provider>
  );
};

export default AppShell;
