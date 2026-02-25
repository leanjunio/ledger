import React from "react";
import { TreeNode } from "../tauriClient";

interface OutlineProps {
  nodes: TreeNode[];
}

const Outline: React.FC<OutlineProps> = ({ nodes }) => {
  return (
    <div className="outline">
      <h3>Outline</h3>
      <div className="outline-content">
        {nodes.length === 0 ? (
          <p className="empty">No content</p>
        ) : (
          nodes.map((node) => (
            <div
              key={node.id}
              className="node"
              style={{
                paddingLeft: `${node.depth * 1.5}em`,
              }}
            >
              <span className="node-text">{node.text || "(empty)"}</span>
              {node.tags.length > 0 && (
                <span className="tags">
                  {" "}
                  {node.tags.map((t) => `#${t}`).join(" ")}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Outline;
