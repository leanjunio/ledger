import { writable } from 'svelte/store';

export interface DirNode {
	name: string;
	path: string;
	children: DirNode[];
}

export interface FileEntry {
	name: string;
	path: string;
}

export const rootPath = writable<string | null>(null);
export const tree = writable<DirNode[]>([]);
export const selectedFolderPath = writable<string | null>(null);
export const fileList = writable<FileEntry[]>([]);
export const currentFilePath = writable<string | null>(null);
export const editorContent = writable<string>('');
export const dirty = writable<boolean>(false);
