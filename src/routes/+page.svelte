<script lang="ts">
	import { rootPath, currentFilePath, selectedFolderPath } from '$lib/stores/app';
	import FileList from '$lib/components/FileList.svelte';
	import Editor from '$lib/components/Editor.svelte';
</script>

{#if $rootPath === null}
	<p class="empty-state">Open a folder to get started.</p>
{:else if $currentFilePath}
	<Editor />
{:else if $selectedFolderPath}
	<FileList />
{:else}
	<p class="hint">Select a folder in the sidebar to see files.</p>
{/if}

<style>
	.empty-state,
	.hint {
		margin: 1rem 0;
		color: #666;
	}
</style>
