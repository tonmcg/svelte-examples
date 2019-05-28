<script>
	import { tweened } from 'svelte/motion';
	import { fade } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { scaleLinear } from 'd3-scale';
	import { mean,variance,extent } from 'd3-array';
	import { regressionLinear } from 'd3-regression';
	import * as easings from 'svelte/easing';
	import data from './data.1.js';
	import SVGCircle from './SVGCircle.svelte';
	import SVGAxis from './SVGAxis.svelte';
	import SVGLine from './SVGLine.svelte';

	// data array
	const members = Object.keys(data);
	const numMembers = members.length;
	let member = members[0];
	let points = data[member];

	// chart margins
	const margins = {
		top: 30,
		right: 30,
		bottom: 60,
		left: 60
	};

	// chart size
	let svg;
	let width = 960;
	let height = 450;

	// MATHS
	let xArr = [];
	let yArr = [];
	Object.keys(data).forEach((arr)=> data[arr].map((d)=> xArr.push(d.x)));
	Object.keys(data).forEach((arr)=> data[arr].map((d)=> yArr.push(d.y)));

	// tweening function
	const tweenedPoints = tweened(points, {
		delay: 0,
		duration: 1250,
		easing: easings.cubicOut
	});

	// extent of the x and y values
	$: [minX, maxX] = extent(xArr);
	$: [minY, maxY] = extent(yArr);
	// mean of x
	$: muX = mean($tweenedPoints, (d) => d.x).toPrecision(3);
	// mean of y
	$: muY = mean($tweenedPoints, (d) => d.y).toPrecision(3);
	// variance of x
	$: varX = variance($tweenedPoints, (d) => d.x).toPrecision(3);
	// variance of y
	$: varY = variance($tweenedPoints, (d) => d.y).toPrecision(3);
	// coefficient of determination
	$: r_sq = lg.rSquared.toPrecision(2);
	// correlation of x and y
	$: r = Math.sqrt(r_sq).toPrecision(2);
	// y-intercept
	$: yInt = lg.b.toPrecision(3);
	// slope
	$: slope = lg.a;

	// scales
	$: xScale = scaleLinear()
		.domain([0, maxX * 1.1])
		.range([margins.left, width - margins.right + margins.left]);

	$: yScale = scaleLinear()
		.domain([0, maxY * 1.1])
		.range([height - margins.bottom, margins.top]);

	// ticks
	$: xTicks = width > 540 ?
		xScale.ticks() : // defaults to 10 ticks, which seems reasonable to me
		xScale.ticks(3);

	$: yTicks = height > 180 ?
		yScale.ticks() : // defaults to 10 ticks
		yScale.ticks(3);

	// linear regression
	$: linearRegression = regressionLinear()
		.x(d => d.x)
		.y(d => d.y)
		.domain([extent(xTicks)[0], extent(xTicks)[1]]);

	// prediction
	$: lg = linearRegression($tweenedPoints);

	$: setTween(member)

	onMount(resize);

	function resize() {
		({
			width,
			height
		} = svg.getBoundingClientRect());
	}

	function setTween(key) {
		tweenedPoints.set(data[key]);
	}

	var index = 0;
	setInterval(() => {
		member = members[index];
		index = (index + 1) % numMembers;
	}, 2000)
</script>

<svelte:window on:resize={resize} />

<div class='chart'>
	<h1 class="g-header centered">Datasaurus</h1>
	<p class="lede centered">Exercises in Tweening SVG Elements with Svelte</p>

	<svg bind:this={svg}>
		<!-- y axis -->
		<g class='axis y-axis'>
			{#each yTicks as tick}
			<SVGAxis axisType='yAxis' translate='translate(0, {yScale(tick)})' x1={xScale(extent(xTicks)[0])} x2={xScale(extent(xTicks)[1])} x={margins.left - 4} y='4' text={tick}></SVGAxis>
			{/each}
			<!-- label -->
			<text class='label' transform={'translate(0,' + ((height - margins.bottom + margins.top) / 2) + ')'} x='4' y='4' text-anchor='start'>y1</text>
		</g>

		<!-- x axis -->
		<g class='axis x-axis'>
			{#each xTicks as tick}
			<SVGAxis axisType='xAxis' translate='translate({xScale(tick)},0)' y1={yScale(extent(yTicks)[0])} y2={yScale(extent(yTicks)[1])} y={height - margins.bottom + 12} text={tick}></SVGAxis>
			{/each}
			<!-- label -->
			<text class='label' transform={'translate(' + ((width - margins.right + margins.left) / 2) + ',' + height + ')'} x='0' y='-4' text-anchor='start'>x1</text>
		</g>

		<!-- points -->
		<g class='points'>
			{#each $tweenedPoints as {x, y}}
			<SVGCircle r='3' fill='grey' fillOpacity='0.4' stroke='orange' cx={xScale(x)} cy={yScale(y)}></SVGCircle>
			{/each}
		</g>
		
		<!-- regression line -->
		<g transform={'translate(0,0)'}>
			<SVGLine strokeDasharray='4,2' opacity='0.35' strokeWidth='2' x1={xScale(lg[0][0])} x2={xScale(lg[1][0])} y1={yScale(lg[0][1])} y2={yScale(lg[1][1])}></SVGLine>
			{#if width > 540}
			<text transform={'rotate(-' + Math.atan(1 - ((extent(yTicks)[1] - 0) / (extent(xTicks)[1] - 0)) ) * 180 / Math.PI + ')'} x={xScale(lg[0][0])} y={yScale(lg[0][1])} style='text-anchor:start;font-size:0.8em;'>{'y = ' + yInt + '+' + slope.toPrecision(3) + '(x)'}</text>
			{/if}
		</g>
		<!-- Math.atan(1 - (extent(yTicks)[1] - 0) / (extent(xTicks)[1] - 0)) * 180 / Math.PI -->

		<!-- data set name -->
		<g transform={'translate(' + xScale(extent(xTicks)[1] * 0.875) + ',' + ((height - margins.bottom + 16) * 0.75) + ')'}>
			{#each [member] as m (m)}
			<text transition:fade class="member" x='0' y='0' text-anchor='middle'>{m.toUpperCase()}</text>
			{/each}
		</g>
		
	</svg>
	<!-- summary statistics -->
	<table style={'padding-left:' + (margins.left) + 'px;padding-right:' + (margins.right) + 'px;'}>
		<thead>
			<tr>
				<th>Property</th>
				<th>Value</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td><span>Mean of <em>x</em></span></td>
				<td>{muX}</td>
			</tr>
			<tr>
				<td><span>Mean of <em>y</em></span></td>
				<td>{muY}</td>
			</tr>
			<tr>
				<td><span>Sample variance of <em>x</em></span></td>
				<td>{varX}</td>
			</tr>
			<tr>
				<td><span>Sample variance of <em>y</em></span></td>
				<td>{varY}</td>
			</tr>
			<tr>
				<td><span>Correlation between <em>x</em> and <em>y</em></span></td>
				<td>{r}</td>
			</tr>
			<tr>
				<td><span>Coefficient of determination of the linear equation</span></td>
				<td>{r_sq}</td>
			</tr>
		</tbody>
	</table>
</div>

<style>
	.chart {
		width: 100%;
		max-width: 960px;
		height: 100%;
		min-height: 450px;
		max-height: 450px;
		margin: 0 auto;
	}

	svg {
		width: 100%;
		height: 100%;
		min-height: 450px;
	}

	table {
		width: 100%;
	}

	td:nth-child(1),
	th:nth-child(1) {
		text-align: left;
		width: 65%;
	}

	td:nth-last-child(1),
	th:nth-last-child(1) {
		text-align: right;
	}

	.axis .label {
		font-size: large;
	}
	.member {
		font-size: 2.5em;
	}
</style>