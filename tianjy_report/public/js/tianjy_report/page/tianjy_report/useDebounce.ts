import { computed, ComputedRef, onUnmounted, ref } from 'vue';

export default function useDebounce<T, P extends any[]>(
	fn: (...p: P) => PromiseLike<T>,
	ms: number = 500,
	{
		maxWait = Infinity,
		render = () => { },
	}: {
		render?(v: T): void
		maxWait?: number
	} = {}
): [
		(...p: P) => void,
		ComputedRef<boolean>,
		ComputedRef<boolean>,
		(...p: P) => Promise<void>
	] {
	const loadingCount = ref(0);
	const loading = computed(() => Boolean(loadingCount.value));
	const wait = ref(false);
	const waiting = computed(() => wait.value);

	const unmounted = ref(false);
	onUnmounted(() => { unmounted.value = true; });

	let timeout: any = undefined;
	let lastTime = 0;
	function cancel() {
		clearTimeout(timeout);
		wait.value = false;
		lastTime = 0;
	}
	onUnmounted(() => { cancel(); });
	async function load(...p: P) {
		if (unmounted.value) { return; }
		loadingCount.value++;
		cancel();
		try {
			const result: T = await fn(...p);
			if (loadingCount.value === 1) {
				render(result);
			}
		} finally {
			loadingCount.value--;
		}

	}
	function run(...p: P) {
		if (unmounted.value) { return; }
		const now = Number(new Date());
		if (!lastTime) { lastTime = now + maxWait; }
		clearTimeout(timeout);
		wait.value = true;
		timeout = setTimeout(load, Math.min(ms, lastTime - now), ...p);
	}
	return [run, loading, waiting, load];
}
