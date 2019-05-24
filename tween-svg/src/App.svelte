<script>
	import { onMount } from 'svelte';
	import SVGRect from './SVGRect.svelte';
	import { tweened } from 'svelte/motion';
	import { cubicInOut } from 'svelte/easing';

	const progress = tweened(0, {
		duration: 1000,
		easing: cubicInOut
	});

	// chart dimensions
	let svg;
	let width = window.innerWidth - 15;
	let height = '30px';

	onMount(resize);

	function resize() {
		({ width, height } = svg.getBoundingClientRect());
	}	

</script>

<style>
	svg {
		width: 100%;
		height: 100%;
	}

	.chart {
		width: 100%;
		max-width: 960px;
		height: calc(100% - 4em);
		min-height: 30px;
		max-height: 30px;
		margin: 0 auto;
	}

	progress {
		display: block;
		width: 100%;
	}

	button {
		cursor: pointer;
	}
</style>

<svelte:window on:resize='{resize}'/>

<div class='chart'>
	<h1 class="g-header centered">SVG Progress Bar</h1>
	<p class="lede centered">Tweening an SVG Progress Bar with Svelte</p>

	<p>SVG</p>
	<div class='chart'>
		<svg bind:this={svg}>
			<SVGRect 
				x='0'
				y='0'
				width={width} 
				height='5.75'
				rx='3.25'
				ry='3.25'
				stroke='#000'
				strokeWidth='0.1'
				fill='grey'
				fillOpacity='0.15'/>
			<SVGRect 
				x='0'
				y='0'
				width={width * $progress}
				height='5.75'
				rx='3.25'
				ry='3.25'
				strokeWidth='0'
				fill='steelblue'
				fillOpacity='0.75'/>
		</svg>
	</div>

	<p>HTML</p>
	<progress value={$progress}></progress>

	{#each [0,0.25,0.5,0.75,1] as percentage}

	<button on:click={() => progress.set(percentage)}>
		{percentage * 100 + '%'}
	</button>
	{/each}

</div>
