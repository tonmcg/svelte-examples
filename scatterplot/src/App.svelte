<script>
	import { tweened } from 'svelte/motion';
	import { onMount } from 'svelte';
	import { scaleLinear } from 'd3-scale';
	import { extent } from 'd3-array';
	import { regressionLinear } from 'd3-regression';
	import * as easings from 'svelte/easing';
	import data from './data.js';
	import SVGCircle from './SVGCircle.svelte';
	import SVGAxis from './SVGAxis.svelte';
	import SVGLine from './SVGLine.svelte';

	// data array
	let member = 'a';
	let points = data[member];

	// chart size
	let svg;
	let width = 500;
	let height = 180;

	// chart margin
	const margins = { top: 20, right: 20, bottom: 40, left: 25 };

	// tweening function
	const tweenedPoints = tweened(points, {
		delay: 0,
		duration: 750,
		easing: easings.cubicOut
	});

	// MATHS
	// array range
	const [minX, maxX] = extent($tweenedPoints,(d) => d.x);
	const [minY, maxY] = extent($tweenedPoints,(d) => d.y);

	// linear regression
	const linearRegression = regressionLinear()
		.x(d => d.x)
		.y(d => d.y)
		.domain([0, 20]);
	
	// prediction
	const lg = linearRegression($tweenedPoints);
	  
	// scales
	$: xScale = scaleLinear()
		.domain([0, 20])
		.range([margins.left, width - margins.right]);

	$: yScale = scaleLinear()
		.domain([0, 15])
		.range([height - margins.bottom, margins.top]);

	// ticks
	$: xTicks = width > 360 ?
		[0, 4, 8, 12, 16, 20] :
		[0, 10, 20];

	$: yTicks = height > 180 ?
		[0, 3, 6, 9, 12, 15] :
		[0, 5, 15];

	onMount(resize);

	function resize() {
		({ width, height } = svg.getBoundingClientRect());
	}

	function setTween(key) {
		tweenedPoints.set(data[key]);
	}

	setTimeout(()=> {
		member = 'd';
	}, 1500)
	
	$: setTween(member)
</script>

<svelte:window on:resize='{resize}'/>

<div class='chart'>
	<h1 class="g-header centered">Anscombe's Quartet</h1>
	<p class="lede centered" style="margin-bottom:1.2rem">Tweening a Scatterplot with Svelte and Harry Stevens' D3 Regression</p>

	<svg bind:this={svg}>
		<!-- y axis -->
		<g class='axis y-axis'>
			{#each yTicks as tick}
			<SVGAxis axisType='yAxis' translate='translate(0, {yScale(tick)})' x1='{xScale(0)}' x2='{xScale(extent(xTicks)[1])}' x='{margins.left - 8}' y='+4' text={tick}></SVGAxis>
			{/each}
		</g>

		<!-- x axis -->
		<g class='axis x-axis'>
			{#each xTicks as tick}
			<SVGAxis axisType='xAxis' translate='translate({xScale(tick)},0)' y1='{yScale(0)}' y2='{yScale(extent(yTicks)[1])}' y='{height - margins.bottom + 16}' text={tick}></SVGAxis>
			{/each}
		</g>
		<!-- points -->
		<g class='points'>
			{#each $tweenedPoints as {x, y}}
				<SVGCircle r='10' fill='orange' fillOpacity='0.4' stroke='orange' cx='{xScale(x)}' cy='{yScale(y)}'></SVGCircle>
			{/each}
		</g>
		<!-- regression line -->
		<SVGLine translate='translate(0,0)' x1='{xScale(lg[0][0])}' x2='{xScale(lg[1][0])}' y1='{yScale(lg[0][1])}' y2='{yScale(lg[1][1])}'></SVGLine>
	</svg>
	<br/>
	<h3>Select quartet member:</h3>
	<div style='display:flex;'>
		
		{#each Object.keys(data) as player}
		<label style='margin:auto;'>
			<input on:change={(e)=> member = e.target.__value } type=radio bind:group={member} value={player}>
			{player.toUpperCase()}
		</label>
		{/each}

	</div>	
</div>

<style>
	.chart {
		width: 100%;
		max-width: 960px;
		height: calc(100% - 4em);
		min-height: 280px;
		max-height: 450px;
		margin: 0 auto;
	}

	svg {
		width: 100%;
		height: 100%;
	}
</style>