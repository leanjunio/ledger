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
	import { Button } from '$lib/components/ui/button';

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

<div class="flex flex-col h-full bg-background border border-border rounded-md overflow-hidden">
	<div class="mb-2">
		<Button type="button" onclick={newFile}>New file</Button>
	</div>
	<ul class="list-none m-0 p-0 flex flex-col gap-0.5">
		{#each $fileList as entry (entry.path)}
			<li class="flex items-center gap-1">
				<button
					type="button"
					class="flex-1 text-left px-2 py-1.5 text-sm rounded hover:bg-accent text-foreground border-0 bg-transparent cursor-pointer min-w-0"
					class:bg-accent={$currentFilePath === entry.path}
					onclick={() => openFile(entry)}
				>
					{entry.name}
				</button>
				<Button
					variant="ghost"
					size="icon"
					title="Delete"
					type="button"
					onclick={(e) => { e.stopPropagation(); deleteFile(entry.path); }}
				>
					✕
				</Button>
			</li>
		{/each}
	</ul>
</div>
