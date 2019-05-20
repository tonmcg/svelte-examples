<script>
	export let progress;
	let width = window.innerWidth - 15;
</script>

<style>
</style>

<svg width={width} height='10'>
	<rect x='0' y='0' rx="3.25" width={width} height='5.75' style='stroke:#000;stroke-width:0.1px;fill:grey;fill-opacity:0.15;'></rect>
	<rect x='0' y='0' rx="3.25" width={width * progress} height='5.75' style='fill:purple;fill-opacity:0.75;'></rect>
</svg>