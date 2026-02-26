<script lang="ts">
	import { invoke } from '@tauri-apps/api/core';
	import { marked } from 'marked';
	import {
		rootPath,
		currentFilePath,
		editorContent,
		dirty,
		fileList,
		selectedFolderPath
	} from '$lib/stores/app';
	import type { FileEntry } from '$lib/stores/app';

	let localContent = $state($editorContent);

	$effect(() => {
		localContent = $editorContent;
	});

	function onInput(e: Event) {
		const t = (e.target as HTMLTextAreaElement);
		if (t) {
			localContent = t.value;
			editorContent.set(localContent);
			dirty.set(true);
		}
	}

	function renderedHtml(): string {
		return marked.parse(localContent ?? '', { async: false }) as string;
	}

	async function save() {
		const path = $currentFilePath;
		const root = $rootPath;
		if (!path || !root) return;
		try {
			await invoke('write_file', { path, root, content: localContent });
			dirty.set(false);
		} catch (e) {
			console.error('Save failed', e);
		}
	}

	function back() {
		currentFilePath.set(null);
		editorContent.set('');
		dirty.set(false);
	}

	async function deleteCurrent() {
		if (!confirm('Delete this file?')) return;
		const path = $currentFilePath;
		const root = $rootPath;
		const folder = $selectedFolderPath;
		if (!path || !root) return;
		try {
			await invoke('delete_file', { path, root });
			currentFilePath.set(null);
			editorContent.set('');
			dirty.set(false);
			if (folder) {
				const result = await invoke<FileEntry[]>('list_markdown_files', {
					folderPath: folder,
					root
				});
				fileList.set(result);
			}
		} catch (e) {
			console.error('Delete failed', e);
		}
	}
</script>

<div class="editor-container">
	<div class="toolbar">
		<button type="button" onclick={back}>Back</button>
		<button type="button" onclick={save} disabled={!$dirty}>Save</button>
		<button type="button" onclick={deleteCurrent}>Delete</button>
	</div>
	<div class="editor-split">
		<textarea
			class="editor-textarea"
			value={localContent}
			oninput={onInput}
			placeholder="Write markdown..."
			spellcheck="true"
		></textarea>
		<div class="preview-pane">
			<div class="preview-content">
				{@html renderedHtml()}
			</div>
		</div>
	</div>
</div>

<style>
	.editor-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		min-height: 0;
	}
	.toolbar {
		display: flex;
		gap: 0.5rem;
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
	.toolbar button:disabled {
		opacity: 0.6;
		cursor: default;
	}
	.editor-split {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		flex: 1;
		min-height: 0;
	}
	.editor-textarea {
		width: 100%;
		height: 100%;
		min-height: 200px;
		padding: 0.5rem;
		border: 1px solid #ccc;
		border-radius: 4px;
		font-family: ui-monospace, monospace;
		font-size: 0.9rem;
		resize: none;
		box-sizing: border-box;
	}
	.preview-pane {
		border: 1px solid #ccc;
		border-radius: 4px;
		overflow: auto;
		background: #fafafa;
	}
	.preview-content {
		padding: 0.75rem;
		font-size: 0.9rem;
		line-height: 1.5;
	}
	.preview-content :global(h1) {
		font-size: 1.5rem;
		margin-top: 0;
	}
	.preview-content :global(h2) {
		font-size: 1.25rem;
	}
	.preview-content :global(pre) {
		background: #eee;
		padding: 0.5rem;
		overflow: auto;
		border-radius: 4px;
	}
	.preview-content :global(code) {
		background: #eee;
		padding: 0.1em 0.3em;
		border-radius: 3px;
	}
</style>
