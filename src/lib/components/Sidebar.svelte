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
		class="tree-row"
		class:selected={$selectedFolderPath === n.path}
		style="padding-left: {depth * 0.75 + 0.5}rem"
		role="button"
		tabindex="0"
		onclick={() => selectFolder(n.path)}
		onkeydown={(e) => e.key === 'Enter' && selectFolder(n.path)}
	>
		{#if hasChildren}
			<button
				type="button"
				class="expand-btn"
				aria-expanded={isExpanded}
				onclick={(e) => { e.stopPropagation(); toggle(n.path); }}
			>
				{isExpanded ? '▼' : '▶'}
			</button>
		{:else}
			<span class="expand-placeholder"></span>
		{/if}
		<span class="node-name">{n.name || '(unnamed)'}</span>
	</div>
	{#if hasChildren && isExpanded}
		{#each n.children as child (child.path)}
			{@render treeNode(child, depth + 1)}
		{/each}
	{/if}
{/snippet}

{#if $rootPath}
	<nav class="sidebar-tree">
		{#each $tree as node (node.path)}
			{@render treeNode(node, 0)}
		{/each}
	</nav>
{/if}

<style>
	.sidebar-tree {
		padding: 0.25rem 0;
	}
	.tree-row {
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.25rem 0.5rem;
		cursor: pointer;
		font-size: 0.9rem;
		border-radius: 4px;
	}
	.tree-row:hover {
		background: #eee;
	}
	.tree-row.selected {
		background: #d0e0ff;
	}
	.expand-btn {
		width: 1.25rem;
		padding: 0;
		border: none;
		background: none;
		cursor: pointer;
		font-size: 0.6rem;
		flex-shrink: 0;
	}
	.expand-placeholder {
		width: 1.25rem;
		display: inline-block;
		flex-shrink: 0;
	}
	.node-name {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
