<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import { invoke } from '@tauri-apps/api/core';
	import { rootPath, tree } from '$lib/stores/app';
	import TopBar from '$lib/components/TopBar.svelte';
	import Sidebar from '$lib/components/Sidebar.svelte';

	onMount(async () => {
		let saved = await invoke<string | null>('get_saved_root');
		if (!saved) {
			const testRoot = await invoke<string | null>('get_test_root');
			if (testRoot) {
				await invoke('set_saved_root', { path: testRoot });
				saved = testRoot;
			}
		}
		if (saved) {
			rootPath.set(saved);
			try {
				const result = await invoke<{ name: string; path: string; children: unknown[] }[]>(
					'list_directory_tree',
					{ root: saved }
				);
				tree.set(result);
			} catch {
				tree.set([]);
			}
		}
	});
</script>

<header class="topbar-wrap">
	<TopBar />
</header>
<div class="app-body">
	<aside class="sidebar">
		<Sidebar />
	</aside>
	<main class="main">
		<slot />
	</main>
</div>

<style>
	:global(body) {
		margin: 0;
		font-family: system-ui, sans-serif;
	}
	.topbar-wrap {
		height: 2.5rem;
		border-bottom: 1px solid #ccc;
		display: flex;
		align-items: center;
		padding: 0 0.5rem;
	}
	.app-body {
		display: flex;
		height: calc(100vh - 2.5rem);
	}
	.sidebar {
		width: 12rem;
		border-right: 1px solid #ccc;
		overflow: auto;
	}
	.main {
		flex: 1;
		overflow: auto;
		padding: 0.5rem;
	}
</style>
