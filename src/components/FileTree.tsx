import React from "react";
import * as tauriClient from "../tauriClient";
import { useAppState } from "./AppShell";

interface FileTreeProps {
  filePaths: string[];
  selectedPath: string | null;
  onSelectFile: (path: string) => Promise<void>;
  onOpenVault: (path: string) => Promise<void>;
  onRefreshList: () => Promise<void>;
}

const FileTree: React.FC<FileTreeProps> = ({
  filePaths,
  selectedPath,
  onSelectFile,
  onOpenVault,
  onRefreshList,
}) => {
  const { dispatch } = useAppState();

  const handleOpenVault = async () => {
    const path = await tauriClient.selectFolder();
    if (path) {
      await onOpenVault(path);
    }
  };

  const handleCreateFile = async () => {
    const name = window.prompt("File name (e.g. note.md):");
    if (!name || !name.trim()) return;
    let path = name.trim();
    if (!path.endsWith(".md")) path += ".md";
    try {
      await tauriClient.createFile(path);
      await onRefreshList();
      await onSelectFile(path);
    } catch (err) {
      console.error(err);
      alert(String(err));
    }
  };

  const handleDeleteFile = async (path: string) => {
    if (!confirm(`Delete "${path}"?`)) return;
    try {
      await tauriClient.deleteFile(path);
      dispatch({ type: "CLEAR_SELECTION" });
      await onRefreshList();
    } catch (err) {
      console.error(err);
      alert(String(err));
    }
  };

  const handleFileClick = async (path: string) => {
    await onSelectFile(path);
  };

  return (
    <div className="file-tree">
      <div className="file-tree-header">
        <h2>Files</h2>
        <div className="file-tree-buttons">
          <button onClick={handleOpenVault} title="Open vault">
            📁
          </button>
          <button onClick={handleCreateFile} title="Create file">
            ➕
          </button>
        </div>
      </div>
      <ul className="file-list">
        {filePaths.length === 0 ? (
          <li className="empty">No .md files</li>
        ) : (
          filePaths.map((path) => (
            <li key={path}>
              <div className="file-item">
                <a
                  href="#"
                  className={selectedPath === path ? "selected" : ""}
                  onClick={(e) => {
                    e.preventDefault();
                    handleFileClick(path);
                  }}
                >
                  {path.split("/").pop() ?? path}
                </a>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteFile(path)}
                  title="Delete file"
                >
                  ✕
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default FileTree;
