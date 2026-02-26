<script lang="ts">
	import { invoke } from '@tauri-apps/api/core';
	import type { DirNode } from '$lib/stores/app';
	import {
		rootPath,
		tree,
		selectedFolderPath,
		fileList,
		currentFilePath
	} from '$lib/stores/app';

	let expanded = $state<Set<string>>(new Set());

	function toggle(path: string) {
		const next = new Set(expanded);
		if (next.has(path)) next.delete(path);
		else next.add(path);
		expanded = next;
	}

	async function selectFolder(path: string) {
		const root = $rootPath;
		if (!root) return;
		selectedFolderPath.set(path);
		currentFilePath.set(null);
		try {
			const result = await invoke<{ name: string; path: string }[]>('list_markdown_files', {
				folderPath: path,
				root
			});
			fileList.set(result);
		} catch {
			fileList.set([]);
		}
	}
</script>

{#snippet treeNode(n, depth)}
	{@const isExpanded = expanded.has(n.path)}
	{@const hasChildren = n.children.length > 0}
	<div
		class="tree-row flex items-center gap-1 py-1 px-2 cursor-pointer text-[0.9rem] rounded hover:bg-accent"
		class:bg-accent={$selectedFolderPath === n.path}
		style="padding-left: {depth * 0.75 + 0.5}rem"
		role="button"
		tabindex="0"
		onclick={() => selectFolder(n.path)}
		onkeydown={(e) => e.key === 'Enter' && selectFolder(n.path)}
	>
		{#if hasChildren}
			<button
				type="button"
				class="expand-btn w-5 p-0 border-0 bg-transparent cursor-pointer text-muted-foreground hover:bg-accent rounded shrink-0 text-[0.6rem]"
				aria-expanded={isExpanded}
				onclick={(e) => { e.stopPropagation(); toggle(n.path); }}
			>
				{isExpanded ? '▼' : '▶'}
			</button>
		{:else}
			<span class="expand-placeholder w-5 inline-block shrink-0"></span>
		{/if}
		<span class="node-name overflow-hidden text-ellipsis whitespace-nowrap">{n.name || '(unnamed)'}</span>
	</div>
	{#if hasChildren && isExpanded}
		{#each n.children as child (child.path)}
			{@render treeNode(child, depth + 1)}
		{/each}
	{/if}
{/snippet}

{#if $rootPath}
	<nav class="sidebar-tree py-1 bg-muted/30 border-r border-border">
		{#each $tree as node (node.path)}
			{@render treeNode(node, 0)}
		{/each}
	</nav>
{/if}
