<script>
	import { tweened } from 'svelte/motion';
	import * as easings from 'svelte/easing';
	
	let tween = tweened([...Array(10)].map(Math.random), {
		delay: 0,
		duration: 3000,
		easing: easings.sineOut
	});
	
</script>
<style>
	.chart {
		width: 100%;
		max-width: 960px;
		height: calc(100% - 4em);
		min-height: 280px;
		max-height: 600px;
		margin: 0 auto;
	}
	table {
		border-collapse: collapse;
		width: 100%;
	}
	th, td {
		border: 1px solid #ddd;
  		padding: 8px;
	}
</style>

<div class='chart'>
	<h1 class="g-header centered">Tweening Arrays</h1>
	<p class="lede centered">Tweening a Random Array of Numbers with Svelte</p>
	<table>
		<thead><tr><th>Index</th><th>Number</th></tr></thead>
		<tbody>
		{#each $tween as number, i}
			<tr><td>{i}</td><td align='right'>{parseInt(number * 100)}</td></tr>
		{/each}
		</tbody>
	</table>
	<br/>
	<button on:click={() => { tween.set([...Array(10)].map(Math.random)) } }>
		Tween Me!
	</button>
	
</div>