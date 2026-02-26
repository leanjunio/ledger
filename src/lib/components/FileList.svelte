<script lang="ts">
	import { invoke } from '@tauri-apps/api/core';
	import type { FileEntry } from '$lib/stores/app';
	import {
		rootPath,
		selectedFolderPath,
		fileList,
		currentFilePath,
		editorContent
	} from '$lib/stores/app';

	async function openFile(entry: FileEntry) {
		const root = $rootPath;
		if (!root) return;
		try {
			const content = await invoke<string>('read_file', { path: entry.path, root });
			currentFilePath.set(entry.path);
			editorContent.set(content);
		} catch (e) {
			console.error('Read file failed', e);
		}
	}

	async function newFile() {
		const root = $rootPath;
		const folder = $selectedFolderPath;
		if (!root || !folder) return;
		try {
			await invoke('create_file', {
				parentFolder: folder,
				root,
				filename: 'untitled.md'
			});
			const result = await invoke<FileEntry[]>('list_markdown_files', {
				folderPath: folder,
				root
			});
			fileList.set(result);
		} catch (e) {
			console.error('Create file failed', e);
		}
	}

	async function deleteFile(path: string) {
		if (!confirm('Delete this file?')) return;
		const root = $rootPath;
		if (!root) return;
		try {
			await invoke('delete_file', { path, root });
			if ($currentFilePath === path) {
				currentFilePath.set(null);
				editorContent.set('');
			}
			const folder = $selectedFolderPath;
			if (folder) {
				const result = await invoke<FileEntry[]>('list_markdown_files', {
					folderPath: folder,
					root
				});
				fileList.set(result);
			}
		} catch (e) {
			console.error('Delete file failed', e);
		}
	}
</script>

<div class="file-list">
	<div class="toolbar">
		<button type="button" onclick={newFile}>New file</button>
	</div>
	<ul class="files">
		{#each $fileList as entry (entry.path)}
			<li class="file-row">
				<button
					type="button"
					class="file-name"
					class:selected={$currentFilePath === entry.path}
					onclick={() => openFile(entry)}
				>
					{entry.name}
				</button>
				<button
					type="button"
					class="delete-btn"
					title="Delete"
					onclick={(e) => { e.stopPropagation(); deleteFile(entry.path); }}
				>
					✕
				</button>
			</li>
		{/each}
	</ul>
</div>

<style>
	.file-list {
		display: flex;
		flex-direction: column;
		height: 100%;
	}
	.toolbar {
		margin-bottom: 0.5rem;
	}
	.toolbar button {
		padding: 0.35rem 0.75rem;
		cursor: pointer;
		border: 1px solid #888;
		border-radius: 4px;
		background: #fff;
		font-size: 0.9rem;
	}
	.files {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.file-row {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		margin-bottom: 0.15rem;
	}
	.file-name {
		flex: 1;
		text-align: left;
		padding: 0.35rem 0.5rem;
		border: none;
		background: none;
		cursor: pointer;
		font-size: 0.9rem;
		border-radius: 4px;
	}
	.file-name:hover {
		background: #eee;
	}
	.file-name.selected {
		background: #d0e0ff;
	}
	.delete-btn {
		padding: 0.2rem 0.4rem;
		border: none;
		background: none;
		cursor: pointer;
		color: #888;
		font-size: 0.85rem;
		border-radius: 4px;
	}
	.delete-btn:hover {
		background: #fcc;
		color: #c00;
	}
</style>
