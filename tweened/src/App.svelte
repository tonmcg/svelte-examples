<script>
	import SVGProgress from './SVGProgress.svelte';
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';

	const progress = tweened(0, {
		duration: 750,
		easing: cubicInOut
	});

</script>

<style>
	progress {
		display: block;
		width: 100%;
	}

	button {
		cursor: pointer;
	}
</style>

<p>SVG</p>
<SVGProgress progress={$progress}/>

<p>HTML</p>
<progress value={$progress}></progress>

{#each [0,0.25,0.5,0.75,1] as percentage}

<button on:click={() => progress.set(percentage)}>
	{percentage * 100 + '%'}
</button>

{/each}