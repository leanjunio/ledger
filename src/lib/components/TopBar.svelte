<script lang="ts">
	import { invoke } from '@tauri-apps/api/core';
	import { rootPath, tree } from '$lib/stores/app';
	import { Button } from '$lib/components/ui/button';

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

<div class="flex h-full items-center gap-4 border-b bg-background">
	<Button type="button" data-testid="open-folder-button" onclick={openFolder}>Open folder</Button>
	{#if $rootPath}
		<span
			class="max-w-80 truncate text-muted-foreground"
			title={$rootPath}
		>
			{truncatedPath($rootPath)}
		</span>
	{/if}
</div>
