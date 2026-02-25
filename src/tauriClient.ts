import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

/**
 * TreeNode represents a single list item in the parsed hierarchy.
 * Fields match the contract in tauri-commands.md.
 */
export type TreeNode = {
  id: string | number;
  depth: number;
  text: string;
  tags: string[];
  parent_id: string | number | null;
  children_ids: (string | number)[];
};

/**
 * QueryResultItem is a tagged list item result from query_by_tag.
 */
export type QueryResultItem = {
  file_path: string;
  parent_path: string | null;
  node: TreeNode;
};

/**
 * SearchMatch is a full-text search result.
 */
export type SearchMatch = {
  file_path: string;
  snippet_or_line: string;
  start_offset?: number;
  end_offset?: number;
};

/**
 * Session data returned by get_session.
 */
export type SessionData = {
  last_vault_path?: string;
  last_file_path?: string;
  theme?: string;
};

/**
 * Vault info returned by open_vault.
 */
export type VaultInfo = {
  root_path: string;
  file_paths: string[];
};

/**
 * Wrap all Tauri invoke calls in a typed client module.
 * These functions match the commands defined in tauri-commands.md.
 */

export async function openVault(path: string): Promise<VaultInfo> {
  return invoke<VaultInfo>("open_vault", { path });
}

export async function getSession(): Promise<SessionData> {
  return invoke<SessionData>("get_session");
}

export async function saveSession(
  data: Partial<SessionData>
): Promise<void> {
  return invoke<void>("save_session", data);
}

export async function listFiles(): Promise<string[]> {
  return invoke<string[]>("list_files");
}

export async function readFile(path: string): Promise<string> {
  return invoke<string>("read_file", { path });
}

export async function writeFile(path: string, content: string): Promise<void> {
  return invoke<void>("write_file", { path, content });
}

export async function createFile(path: string): Promise<void> {
  return invoke<void>("create_file", { path });
}

export async function deleteFile(path: string): Promise<void> {
  return invoke<void>("delete_file", { path });
}

export async function parseFile(
  path: string,
  content: string
): Promise<{ nodes: TreeNode[] }> {
  return invoke<{ nodes: TreeNode[] }>("parse_file", { path, content });
}

export async function queryByTag(
  tagNames: string[],
  scopeNodeId?: string,
  paths?: string[]
): Promise<QueryResultItem[]> {
  return invoke<QueryResultItem[]>("query_by_tag", {
    tag_names: tagNames,
    scope_node_id: scopeNodeId,
    paths,
  });
}

export async function searchFullText(
  query: string,
  paths?: string[],
  fuzzy?: boolean
): Promise<SearchMatch[]> {
  return invoke<SearchMatch[]>("search_full_text", { query, paths, fuzzy });
}

export async function logFromFrontend(
  level: string,
  message: string,
  payload?: object
): Promise<void> {
  return invoke<void>("log_from_frontend", { level, message, payload });
}

export async function selectFolder(): Promise<string | null> {
  const selected = await open({
    directory: true,
    multiple: false,
  });
  if (selected === null || typeof selected !== "string") return null;
  return selected;
}
