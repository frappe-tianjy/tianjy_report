<template>
	<div>
		<ElSelect v-model="val" filterable remote
			@change="change"
			:remoteMethod="search" :placeholder="label && tt(label)"
			@focus="focus"
			defaultFirstOption
			:teleported="false"
			:loading="loading || waiting">
			<ElOption
				v-for="{ value, label, description } in opts"
				:key="value"
				:label="label"
				:value="value">
				{{ label }}
				<small v-if="description">{{ description }}</small>
			</ElOption>
		</ElSelect>
	</div>
</template>

<script setup lang='ts'>
import { ref, defineProps, defineEmits, onMounted, computed } from 'vue';

import useDebounce from '../useDebounce';

const props = defineProps<{
	label?: string;
	modelValue?: string;
}>();
const emit = defineEmits<{
	(event: 'update:modelValue', value: any): void;
	(event: 'label', value: string): void;
	(event: 'change', value: string): void;
}>();

const tt = __;

interface Option {
	value: string;
	label: string;
	description?: string;
}
const opts = ref<Option[]>([]);
const map = computed(() => {
	const map = new Map(opts.value.map(v => [v.value, v.label]));
	return map;
});

interface Result {
	value: string;
	label?: string;
	description?: string;
}
const [remoteMethod, loading, waiting] = useDebounce(
	async (query?: string) => {
		const args = {
			txt: query || '', doctype: 'DocType',
		};
		return frappe.call<{ results: Result[] }>({
			type: 'POST',
			method: 'frappe.desk.search.search_link',
			args,
		}).then(v => v?.results || []);
	}, 300, {
	render: v => {
		opts.value = [
			...v.map(({ value, label, description }) => ({ value, label: label || tt(value), description })),
		];
	},
});
let value = '';
function search(query?: string) {
	value = query || '';
	remoteMethod(query);
}
function focus() {
	if (value) { return; }
	if (opts.value.length) { return; }
	if (loading.value) { return; }
	if (waiting.value) { return; }
	remoteMethod('');
}

const val = computed({
	get: () => props.modelValue,
	set: v => {
		emit('update:modelValue', v || '');
		emit('label', map.value.get(v || '') || '');
	},
});
function change(v){
	emit('change', v || '');
}
</script>

<style lang='less' scoped>
</style>
