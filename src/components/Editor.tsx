import React, { useEffect } from "react";
import * as tauriClient from "../tauriClient";
import { useAppState } from "./AppShell";

interface EditorProps {
  selectedPath: string | null;
  content: string;
  onContentChange: (content: string) => void;
  onSave: () => Promise<void>;
}

let outlineDebounce: ReturnType<typeof setTimeout> | null = null;

const Editor: React.FC<EditorProps> = ({
  selectedPath,
  content,
  onContentChange,
  onSave,
}) => {
  const { dispatch } = useAppState();

  // Update outline when content changes (debounced)
  useEffect(() => {
    if (!selectedPath || !content) {
      dispatch({ type: "SET_OUTLINE_NODES", payload: [] });
      return;
    }

    if (outlineDebounce) clearTimeout(outlineDebounce);
    outlineDebounce = setTimeout(async () => {
      outlineDebounce = null;
      try {
        const result = await tauriClient.parseFile(selectedPath, content);
        dispatch({ type: "SET_OUTLINE_NODES", payload: result.nodes });
      } catch {
        dispatch({ type: "SET_OUTLINE_NODES", payload: [] });
      }
    }, 300);

    return () => {
      if (outlineDebounce) clearTimeout(outlineDebounce);
    };
  }, [selectedPath, content, dispatch]);

  const handleDeleteFile = async () => {
    if (!selectedPath) return;
    if (!confirm(`Delete "${selectedPath}"?`)) return;
    try {
      await tauriClient.deleteFile(selectedPath);
      dispatch({ type: "CLEAR_SELECTION" });
      const paths = await tauriClient.listFiles();
      dispatch({ type: "SET_FILE_PATHS", payload: paths ?? [] });
    } catch (err) {
      console.error(err);
      alert(String(err));
    }
  };

  if (!selectedPath) {
    return (
      <div className="editor-area">
        <p className="placeholder">
          Select a file or open a vault to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="editor-area">
      <div className="editor-toolbar">
        <button onClick={onSave} className="save-btn">
          Save
        </button>
        <button onClick={handleDeleteFile} className="danger delete-btn">
          Delete file
        </button>
      </div>
      <textarea
        id="editor-text"
        className="editor-text"
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        placeholder="Markdown content..."
      />
    </div>
  );
};

export default Editor;
