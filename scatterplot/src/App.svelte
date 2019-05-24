<script>
	import { onMount } from 'svelte';
	import { scaleLinear } from 'd3-scale';
	import { extent } from 'd3-array';
	import { regressionLinear } from 'd3-regression';
	import { quintInOut } from 'svelte/easing';
	import { toFrom } from './motion.js';
	import SVGCircle from './SVGCircle.svelte';
	import SVGAxis from './SVGAxis.svelte';
	import SVGLine from './SVGLine.svelte';
	
	const opts = {
		easing: quintInOut
	};

	const animation = {
		from: [
			{ x: 10, y: 8.04 },
			{ x: 8, y: 6.95 },
			{ x: 13, y: 7.58 },
			{ x: 9, y: 8.81 },
			{ x: 11, y: 8.33 },
			{ x: 14, y: 9.96 },
			{ x: 6, y: 7.24 },
			{ x: 4, y: 4.26 },
			{ x: 12, y: 10.84 },
			{ x: 7, y: 4.82 },
			{ x: 5, y: 5.68 }
		],
		to: [
			{ x: 10, y: 9.14 },
			{ x: 8, y: 8.14 },
			{ x: 13, y: 8.74 },
			{ x: 9, y: 8.77 },
			{ x: 11, y: 9.26 },
			{ x: 14, y: 8.1 },
			{ x: 6, y: 6.13 },
			{ x: 4, y: 3.1 },
			{ x: 12, y: 9.13 },
			{ x: 7, y: 7.26 },
			{ x: 5, y: 4.74 }
		],
		easing: t => t,
		duration: i => 1000,
		delay: i => 100,
		alternate: true,
		repeat: true,
		//autoplay: true
	}

	// MATHS
	// array range
	const [minX, maxX] = extent(animation.from,(d) => d.x);
	const [minY, maxY] = extent(animation.from,(d) => d.y);

	// linear regression
	const linearRegression = regressionLinear()
		.x(d => d.x)
		.y(d => d.y)
		.domain([0, 18]);	
	const lg = linearRegression(animation.from);
	
	// animate!
	const s = toFrom(animation, opts);
  
	// chart size
	let svg;
	let width = 500;
	let height = 180;

	// chart margin
	const margins = { top: 20, right: 20, bottom: 40, left: 25 };

	// scales
	$: xScale = scaleLinear()
		.domain([0, 20])
		.range([margins.left, width - margins.right]);

	$: yScale = scaleLinear()
		.domain([0, 12])
		.range([height - margins.bottom, margins.top]);

	// ticks
	$: xTicks = width > 360 ?
		[0, 4, 8, 12, 16, 20] :
		[0, 10, 20];

	$: yTicks = height > 180 ?
		[0, 2, 4, 6, 8, 10, 12] :
		[0, 4, 8, 12];

	onMount(resize);

	function resize() {
		({ width, height } = svg.getBoundingClientRect());
	}	
</script>

<svelte:window on:resize='{resize}'/>

<div class='chart'>
	<h1 class="g-header centered">Anscombe's <strike>Quartet</strike> Duet with Svelte</h1>
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
			{#each $s as {x, y}}
				<SVGCircle r='10' fill='orange' fillOpacity='0.4' stroke='orange' cx='{xScale(x)}' cy='{yScale(y)}'></SVGCircle>
			{/each}
		</g>
		<!-- regression line -->
		<SVGLine translate='translate(0,0)' x1='{xScale(lg[0][0])}' x2='{xScale(lg[1][0])}' y1='{yScale(lg[0][1])}' y2='{yScale(lg[1][1])}'></SVGLine>
	</svg>
	<button on:click={() => s.play()}>Animate</button>
</div>

<style>
	h1 {
		font-size: 3em;
		padding: 0px;
		font-weight: normal;
		text-align: center;
		text-transform: uppercase;
	}

	.lede {
		font-style: italic;
		font-weight: 400;
		font-size: .9em;
		font-size: 14px;
		line-height: 1.4em;
		text-align: center;
	}
	.chart {
		width: 100%;
		max-width: 960px;
		height: calc(100% - 4em);
		min-height: 280px;
		max-height: 600px;
		margin: 0 auto;
	}

	svg {
		width: 100%;
		height: 100%;
	}
</style>