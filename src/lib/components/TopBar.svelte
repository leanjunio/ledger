<script lang="ts">
	import { invoke } from '@tauri-apps/api/core';
	import { rootPath, tree } from '$lib/stores/app';

	async function openFolder() {
		try {
			const path = await invoke<string | null>('open_folder_dialog');
			if (path) {
				await invoke('set_saved_root', { path });
				rootPath.set(path);
				const result = await invoke<{ name: string; path: string; children: unknown[] }[]>(
					'list_directory_tree',
					{ root: path }
				);
				tree.set(result);
			}
		} catch (e) {
			console.error('Open folder failed', e);
		}
	}

	function truncatedPath(p: string, maxLen = 50): string {
		if (p.length <= maxLen) return p;
		return '…' + p.slice(-(maxLen - 1));
	}
</script>

<div class="topbar">
	<button type="button" onclick={openFolder}>Open folder</button>
	{#if $rootPath}
		<span class="root-path" title={$rootPath}>{truncatedPath($rootPath)}</span>
	{/if}
</div>

<style>
	.topbar {
		display: flex;
		align-items: center;
		gap: 1rem;
		height: 100%;
	}
	button {
		padding: 0.35rem 0.75rem;
		cursor: pointer;
		border: 1px solid #888;
		border-radius: 4px;
		background: #fff;
		font-size: 0.9rem;
	}
	button:hover {
		background: #f0f0f0;
	}
	.root-path {
		font-size: 0.85rem;
		color: #666;
		max-width: 20rem;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
