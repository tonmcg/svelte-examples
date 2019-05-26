<script>
	import {tweened} from 'svelte/motion';
	import {onMount} from 'svelte';
	import {scaleLinear} from 'd3-scale';
	import {mean,variance,extent} from 'd3-array';
	import {regressionLinear} from 'd3-regression';
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
		top: 20,
		right: 20,
		bottom: 40,
		left: 50
	};

	// chart size
	let svg;
	let width = 960;
	let height = 450;

	// tweening function
	const tweenedPoints = tweened(points, {
		delay: 0,
		duration: 1250,
		easing: easings.cubicOut
	});

	// MATHS
	let xArr = [];
	let yArr = [];
	Object.keys(data).forEach((arr)=> data[arr].map((d)=> xArr.push(d.x)));
	Object.keys(data).forEach((arr)=> data[arr].map((d)=> yArr.push(d.y)));
	$: [minX, maxX] = extent(xArr);
	$: [minY, maxY] = extent(yArr);
	$: muX = mean($tweenedPoints, (d) => d.x).toPrecision(3);
	$: muY = mean($tweenedPoints, (d) => d.y).toPrecision(3);
	$: sigmaX = variance($tweenedPoints, (d) => d.x).toPrecision(3);
	$: sigmaY = variance($tweenedPoints, (d) => d.y).toPrecision(3);
	$: r_sq = lg.rSquared.toPrecision(2);
	$: r = Math.sqrt(r_sq).toPrecision(2);
	$: beta = lg.b.toPrecision(3);
	$: alpha = lg.a.toPrecision(3);

	// scales
	$: xScale = scaleLinear()
		.domain([0, maxX * 1.1])
		.range([margins.left, width - margins.right]);

	$: yScale = scaleLinear()
		.domain([0, maxY * 1.1])
		.range([height - margins.bottom, margins.top]);

	// ticks
	$: xTicks = width > 540 ?
		xScale.ticks() :
		xScale.ticks(3);

	$: yTicks = height > 180 ?
		xScale.ticks() :
		xScale.ticks(3);

	// linear regression
	$: linearRegression = regressionLinear()
		.x(d => d.x)
		.y(d => d.y)
		.domain([0, maxX * 1.1]);

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

<svelte:window on:resize='{resize}' />

<div class='chart'>
	<h1 class="g-header centered">Anscombe's Quartet</h1>
	<p class="lede centered">Tweening a Svelte Scatterplot</p>

	<h3>Member:</h3>
	<div style='display:flex;'>

		{#each Object.keys(data) as player}
		<label style='margin:auto;'>
			<input disabled on:change={(e)=> member = e.target.__value } type=radio bind:group={member} value={player}>
			{player.toUpperCase()}
		</label>
		{/each}

	</div>	

	<svg bind:this={svg}>
		<!-- y axis -->
		<g class='axis y-axis'>
			{#each yTicks as tick}
			<SVGAxis axisType='yAxis' translate='translate(0, {yScale(tick)})' x1='{xScale(0)}' x2='{xScale(extent(xTicks)[1])}' x='{margins.left - 8}' y='+4' text={tick}></SVGAxis>
			{/each}
			<!-- label -->
			<text class='label' transform={'translate(' + (margins.left - 36) + ',' + ((height - (margins.bottom - margins.top)) / 2 )+ ')'} text-anchor='middle'>y1</text>
		</g>

		<!-- x axis -->
		<g class='axis x-axis'>
			{#each xTicks as tick}
			<SVGAxis axisType='xAxis' translate='translate({xScale(tick)},0)' y1='{yScale(0)}' y2='{yScale(extent(yTicks)[1])}' y='{height - margins.bottom + 16}' text={tick}></SVGAxis>
			{/each}
			<!-- label -->
			<text class='label' transform={'translate(' + ((width / 2) + (margins.left - margins.right)) + ',' + height + ')'} text-anchor='middle'>x1</text>
		</g>
		<!-- points -->
		<g class='points'>
			{#each $tweenedPoints as {x, y}}
				<SVGCircle r='4' fill='grey' fillOpacity='0.4' stroke='grey' cx='{xScale(x)}' cy='{yScale(y)}'></SVGCircle>
			{/each}
		</g>
		<!-- regression line -->
		<SVGLine translate='translate(0,0)' strokeDasharray='4,2' opacity='0.1' strokeWidth='3' x1='{xScale(lg[0][0])}' x2='{xScale(lg[1][0])}' y1='{yScale(lg[0][1])}' y2='{yScale(lg[1][1])}'></SVGLine>
		
	</svg>
	<!-- summary statistics -->
	<table style='margin-left:40px;'>
		<tbody>
			<tr>
				<td><span>Mean of <em>x</em></span></td><td>{muX}</td>
			</tr>
			<tr>
				<td><span>Mean of <em>y</em></span></td><td>{muY}</td>
			</tr>
			<tr>
				<td><span>Sample variance of <em>x</em></span></td><td>{sigmaX}</td>
			</tr>
			<tr>
				<td><span>Sample variance of <em>y</em></span></td><td>{sigmaY}</td>
			</tr>
			<tr>
				<td><span>Correlation between <em>x</em> and <em>y</em></span></td><td>{r}</td>
			</tr>
			<tr>
				<td><span>Linear regression line</span></td><td>{'y = ' + beta + ' + ' + alpha + '(x)'}</td>
			</tr>
			<tr>
				<td><span>Coefficient of determination of the linear equation</span></td><td>{r_sq}</td>
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

	table tbody tr td:nth-child(1) {
		font-weight: bold;
		width: 65%;
	}

	.axis .label {
		font-size: 1.3em;
	}
</style>