import React, { useState } from "react";
import * as tauriClient from "../tauriClient";
import { QueryResultItem, SearchMatch } from "../tauriClient";
import { useAppState } from "./AppShell";

interface SearchAndQueryPanelProps {
  title: string;
  queryResults: QueryResultItem[];
  searchResults: SearchMatch[];
  onResultSelect: (filePath: string) => Promise<void>;
  onClose: () => void;
}

const SearchAndQueryPanel: React.FC<SearchAndQueryPanelProps> = ({
  title,
  queryResults,
  searchResults,
  onResultSelect,
  onClose,
}) => {
  const { dispatch } = useAppState();
  const [queryInput, setQueryInput] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const handleRunQuery = async () => {
    const tag = queryInput.trim();
    if (!tag) return;
    try {
      const items = await tauriClient.queryByTag([tag]);
      dispatch({
        type: "SHOW_RESULTS",
        payload: {
          title: `Query: #${tag}`,
          queryResults: items,
        },
      });
    } catch (err) {
      console.error(err);
      alert(String(err));
    }
  };

  const handleRunSearch = async () => {
    const q = searchInput.trim();
    if (!q) return;
    try {
      const matches = await tauriClient.searchFullText(q, undefined, false);
      dispatch({
        type: "SHOW_RESULTS",
        payload: {
          title: `Search: ${q}`,
          searchResults: matches,
        },
      });
    } catch (err) {
      console.error(err);
      alert(String(err));
    }
  };

  const handleResultClick = async (filePath: string) => {
    await onResultSelect(filePath);
  };

  return (
    <div className="results-panel">
      <div className="results-header">
        <span className="results-title">{title}</span>
        <button onClick={onClose} className="close-btn">
          ✕
        </button>
      </div>

      <div className="search-controls">
        <div className="control-group">
          <label htmlFor="query-input">Tag Query:</label>
          <input
            id="query-input"
            type="text"
            placeholder="e.g. decision"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleRunQuery()}
          />
          <button onClick={handleRunQuery} className="query-btn">
            Query
          </button>
        </div>

        <div className="control-group">
          <label htmlFor="search-input">Full-text Search:</label>
          <input
            id="search-input"
            type="text"
            placeholder="e.g. search term"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleRunSearch()}
          />
          <button onClick={handleRunSearch} className="search-btn">
            Search
          </button>
        </div>
      </div>

      <div className="results-list-container">
        <ul className="results-list">
          {queryResults.length > 0
            ? queryResults.map((item, idx) => {
                const label = `${item.file_path}${
                  item.parent_path ? " · " + item.parent_path : ""
                }: ${item.node.text.slice(0, 50)}${
                  item.node.text.length > 50 ? "..." : ""
                }`;
                return (
                  <li
                    key={idx}
                    onClick={() => handleResultClick(item.file_path)}
                  >
                    {label}
                  </li>
                );
              })
            : searchResults.length > 0
            ? searchResults.map((match, idx) => {
                const label = `${match.file_path}: ${match.snippet_or_line.slice(
                  0,
                  60
                )}${match.snippet_or_line.length > 60 ? "..." : ""}`;
                return (
                  <li
                    key={idx}
                    onClick={() => handleResultClick(match.file_path)}
                  >
                    {label}
                  </li>
                );
              })
            : [
                <li key="empty" className="empty">
                  No results
                </li>,
              ]}
        </ul>
      </div>
    </div>
  );
};

export default SearchAndQueryPanel;
