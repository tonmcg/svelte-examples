// tweening function by @pngwn#8431
import { writable, get } from 'svelte/store'; // eslint-disable-line import/no-unresolved
import { assign, loop, now as now2 } from 'svelte/internal'; // eslint-disable-line import/no-unresolved
import { linear } from 'svelte/easing'; // eslint-disable-line import/no-unresolved

function is_date(obj) {
	return Object.prototype.toString.call(obj) === '[object Date]';
}

function get_interpolator(a, b) {
	if (a === b || a !== a) return () => a;
	const type = typeof a;

	if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
		throw new Error('Cannot interpolate values of different type');
	}

	if (Array.isArray(a)) {
		const arr = b.map((bi, i) => {
			return get_interpolator(a[i], bi);
		});

		return t => arr.map(fn => fn(t));
	}

	if (type === 'object') {
		if (!a || !b) throw new Error('Object cannot be null');

		if (is_date(a) && is_date(b)) {
			a = a.getTime();
			b = b.getTime();
			const delta = b - a;
			return t => new Date(a + t * delta);
		}
		
		const keys = Object.keys(b);
		const interpolators = {};

		keys.forEach(key => {
			interpolators[key] = get_interpolator(a[key], b[key]);
		});

		return t => {
			const result = {};
			keys.forEach(key => {
				result[key] = interpolators[key](t);
			});
			return result;
		};
	}

	if (type === 'number') {
		const delta = b - a;
		return t => a + t * delta;
	}

	throw new Error(`Cannot interpolate ${type} values`);
}

export function toFrom(value, defaults = {}) {
	
		let { 
			to, 
			from, 
			delay, 
			duration, 
			autoplay = false, 
			repeat = false,
			alternate = false
		} = value;
	
	const store = writable(from);
		
	if (from.length !== to.length) {
		throw new Error(`from and to arrays must be of equal length`);
	}
	
	let vals = value.from.map((a, i) => ({
		from: value.from[i],
		to: value.to[i],
		delay: value.delay(i),
		duration: value.duration(i)
	}))
	
	let task;
	let target_value = value.to;

	function set() {
		target_value = vals.map(v => v.to);

		let previous_task = task;
		let started = false;

		let {
			delay = 0,
			easing = linear,
			interpolate = get_interpolator
		} =  defaults;

		const start = now2() + delay;
		let fn = [];
		
		
		task = loop(now => {
			if (now < start) return true;

			if (!started) {	
				const begin = now2();
				fn = vals.map((v, i) => interpolate(v.from, v.to))
				//if (typeof duration === 'function') duration = duration(value, value.to);
				started = true;
			}
			
			if (previous_task) {
				previous_task.abort();
				previous_task = null;
			}

			const elapsed = now - start;
			
			const highest = v => v.reduce((a, n) => a > n.duration + n.delay ? a : n.duration + n.delay, 0)
			
			if (elapsed > highest(vals)) {
				store.set(target_value);
				return false;
			}
		
			store.set(value = fn.map((v, i) => {
				if (elapsed < vals[i].delay) return vals[i].from
				if (elapsed > vals[i].duration + vals[i].delay) return vals[i].to;
				return v(easing((elapsed - vals[i].delay) / vals[i].duration))
			}));
			
			return true;
		});

		return task.promise;
	}
	
	let isPlaying = false, 
			islooping = false, 
			playCount = 0;
	
	async function forwardRepeat() {
		if (alternate && playCount > 0) {
			vals = vals.map(v => ({
				...v, 
				to: v.from,
				from: v.to
			}))
		}
		playCount ++;
		await set();
		if (islooping || (alternate && playCount === 1) ) {
			forwardRepeat();
			return;
		}
		isPlaying = false;
	}
	
	function play() {
		if (isPlaying) return;
		isPlaying = true;
		islooping = repeat;
		forwardRepeat();
  };

	if (autoplay) {
		play();
	}

	return {
		play,
		update: (fn, opts) => set(fn(target_value, value), opts),
		subscribe: store.subscribe
	};
}