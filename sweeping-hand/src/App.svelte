<script>
	import { onMount } from 'svelte';
	import { tweened } from 'svelte/motion';
	import { linear, bounceOut, circOut, cubicOut, elasticOut, expoOut, quadOut, quartOut, quintOut, sineOut } from 'svelte/easing';

	let time = new Date();
	// for a smooth transition between 59 and 0 seconds
	let start = Date.now() / 1000 - (Date.now() / 1000) % 60

	// these automatically update when `time`
	// changes, because of the `$:` prefix
	$: hours = time.getHours();
	$: minutes = time.getMinutes();
	$: seconds = time.getSeconds();

	const sweep = tweened(parseInt((Date.now() / 1000) % 60), {
		duration: 1000,
		easing: linear
	});

	onMount(() => {
		const interval = setInterval(() => {
			time = new Date();
			sweep.set(parseInt(Date.now() / 1000 - start));
		}, 1000);

		return () => {
			clearInterval(interval);
		};
	});
</script>

<style>
	svg {
		width: 100%;
		height: 100%;
	}

	text {
		font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
		font-size: 0.7em;
	}

	.clock-face {
		stroke: #333;
		fill: white;
	}

	.fulcrum {
		fill: rgb(180,0,0);
	}

	.minor {
		stroke: #999;
		stroke-width: 0.5;
	}

	.major {
		stroke: #333;
		stroke-width: 1;
	}

	.hour {
		stroke: #333;
		stroke-linecap: round;
		stroke-width: 1.5;
	}

	.minute {
		stroke: #333;
		stroke-linecap: round;
		stroke-width: 1;
	}

	.second {
		stroke-width: 0.5;
	}

	.second, .second-counterweight {
		stroke: rgb(180,0,0);
	}

	.second-counterweight {
		stroke-width: 2.5;
	}
</style>

<svg viewBox='-50 -50 100 100'>

	<circle class='clock-face' r='48'/>

	<!-- logo -->
	<image href="http://d2f0ora2gkri0g.cloudfront.net/c4/21/c42176b8-664a-427e-96d7-dc1f2e3d2b08.png" width="40" height="40" x="-17.5" y="-35"></image>
	
	<!-- markers -->
	{#each [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55] as minute}
		<line
			class='major'
			y1='36'
			y2='45'
			transform='rotate({30 * minute})'
		/>
	
		{#if minute}
		<g transform='rotate({ (minute / 5 - 6) * 6 * (minute / (minute/5)) })'>
			<text 
				transform='rotate({ ((minute / 5 - 6) * 6 * (minute / (minute/5))) * -1 },0,{ 31 + (1 - (Math.abs((minute/5-6)*6*(minute/(minute/5))) * Math.PI / 180) / Math.PI) })' 
				text-anchor='middle' 
				y='{36 + (Math.abs((minute / 5 - 6) * 6 * ( minute / ( minute / 5))) * Math.PI / 180) / Math.PI - 1}'
			>{minute / 5}
			</text>
		</g>
		{:else}
		<g transform='rotate(-180)'>
			<text 
				transform='rotate(180,0,31)' 
				text-anchor='middle' 
				y='{36 + (Math.abs(180) * Math.PI / 180) / Math.PI - 1}'
			>12
			</text>
		</g>
		{/if}

		{#each [1, 2, 3, 4] as offset}
			<line
				class='minor'
				y1='42'
				y2='45'
				transform='rotate({6 * (minute + offset)})'
			/>
		{/each}
	{/each}

	<!-- hour hand -->
	<line
		class='hour'
		y1='6'
		y2='-28'
		transform='rotate({30 * hours + minutes / 2})'
	/>

	<!-- minute hand -->
	<line
		class='minute'
		y1='6'
		y2='-42'
		transform='rotate({6 * minutes + seconds / 10})'
	/>

	<!-- second hand -->
	<g transform='rotate({6 * $sweep})'>
		<line class='second' y1='10' y2='-36'/>
		<line class='second-counterweight' y1='18' y2='4'/>
	</g>
	
	<!-- pivot -->
	<circle class='fulcrum' r='1.25' />
	
</svg>