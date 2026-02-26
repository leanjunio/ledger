<script lang="ts">
	import { rootPath } from '$lib/stores/app';
</script>

{#if $rootPath === null}
	<p class="empty-state">Open a folder to get started.</p>
{:else}
	<p class="placeholder">Root: {$rootPath}</p>
	<!-- Main area: file list / editor will go here -->
{/if}

<style>
	.empty-state,
	.placeholder {
		margin: 1rem 0;
		color: #666;
	}
</style>
