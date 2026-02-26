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
	import { Button } from '$lib/components/ui/button';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		AlertDialog,
		AlertDialogAction,
		AlertDialogCancel,
		AlertDialogContent,
		AlertDialogDescription,
		AlertDialogFooter,
		AlertDialogHeader,
		AlertDialogTitle
	} from '$lib/components/ui/alert-dialog';
	import { buttonVariants } from '$lib/components/ui/button';

	let localContent = $state($editorContent);
	let deleteDialogOpen = $state(false);

	$effect(() => {
		localContent = $editorContent;
	});

	function onInput() {
		editorContent.set(localContent);
		dirty.set(true);
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

	async function doDelete() {
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

	async function handleConfirmDelete() {
		await doDelete();
		deleteDialogOpen = false;
	}
</script>

<div class="editor-container">
	<div class="toolbar">
		<Button variant="outline" onclick={back}>Back</Button>
		<Button variant="default" onclick={save} disabled={!$dirty}>Save</Button>
		<Button variant="destructive" onclick={() => (deleteDialogOpen = true)}>Delete</Button>
	</div>
	<div class="editor-split">
		<Textarea
			class="editor-textarea"
			bind:value={localContent}
			oninput={onInput}
			placeholder="Write markdown..."
			spellcheck="true"
		/>
		<div class="preview-pane rounded-md border border-border overflow-auto bg-muted/30">
			<div class="preview-content p-3 text-foreground text-sm leading-relaxed">
				{@html renderedHtml()}
			</div>
		</div>
	</div>
</div>

<AlertDialog bind:open={deleteDialogOpen}>
	<AlertDialogContent>
		<AlertDialogHeader>
			<AlertDialogTitle>Delete file?</AlertDialogTitle>
			<AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
		</AlertDialogHeader>
		<AlertDialogFooter>
			<AlertDialogCancel>Cancel</AlertDialogCancel>
			<AlertDialogAction
				class={buttonVariants({ variant: 'destructive' })}
				onclick={handleConfirmDelete}
			>
				Delete
			</AlertDialogAction>
		</AlertDialogFooter>
	</AlertDialogContent>
</AlertDialog>

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
	.editor-split {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		flex: 1;
		min-height: 0;
	}
	:global(.editor-textarea) {
		width: 100%;
		height: 100%;
		min-height: 200px;
		resize: none;
		box-sizing: border-box;
		font-family: ui-monospace, monospace;
	}
	.preview-content :global(h1) {
		font-size: 1.25rem;
		font-weight: 600;
		margin-top: 0;
		margin-bottom: 0.5rem;
	}
	.preview-content :global(h2) {
		font-size: 1.125rem;
		font-weight: 500;
		margin-top: 1rem;
		margin-bottom: 0.25rem;
	}
	.preview-content :global(pre) {
		background: var(--muted);
		padding: 0.75rem;
		overflow: auto;
		border-radius: var(--radius-md);
		margin: 0.5rem 0;
	}
	.preview-content :global(code) {
		background: var(--muted);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}
</style>
