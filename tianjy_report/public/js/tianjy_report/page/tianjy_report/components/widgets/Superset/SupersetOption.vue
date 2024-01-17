<template>
	<div>
		<el-form
			class="form"
			ref="formRef"
			:model="form"
			@submit.prevent
			:rules="rules">
			<el-form-item label="图表" prop="chart">
				<ElSelect
					v-model="form.chart"
					filterable remote
					:remoteMethod="search"
					@focus="focus"
					defaultFirstOption
					:loading="loading || waiting"
					@change="changeSupersetChart">
					<ElOption
						v-for="{ value, label, description } in opts"
						:key="value"
						:label="label"
						:value="value">
						{{ label }}
						<small v-if="description">{{ description }}</small>
					</ElOption>
				</ElSelect>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang='ts'>
import { ref, defineProps, defineEmits, reactive, watch, inject, computed } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElForm, ElSelect, ElOption, ElFormItem } from 'element-plus';

import type { ChartOptions, ChartProvide } from '../../../../type';
import useDebounce from '../../../useDebounce';
const formRef = ref<FormInstance>();
const tt=__;
interface Result {
	value: string;
	label?: string;
	description?: string;
}
interface Props{

}

const props = defineProps<Props>();
interface Emit{
	(event: 'remove'): void;
}
const emit = defineEmits<Emit>();
const chart = inject<ChartProvide>('chart');
interface Option {
	value: string;
	label: string;
	description?: string;
}
const opts = ref<Option[]>([]);

const form = reactive({
	chart: chart?.doc.options?.chart,
});

watch(()=>chart?.doc.options, ()=>{
	form.chart = chart?.doc.options?.chart;
});

const rules = reactive<FormRules>({
	chart: [
		{
			required: true,
			message: '请选择图表',
			trigger: 'change',
		},
	],
});

function changeSupersetChart(v:string){
	if (!chart){ return; }
	chart.doc.options.chart = v;
}

const [remoteMethod, loading, waiting] = useDebounce(
	async (query?: string) => {
		const args = {
			txt: query || '', doctype: 'Guigu Superset Chart',
		};
		return frappe.call<{ results: Result[] }>({
			type: 'POST',
			method: 'frappe.desk.search.search_link',
			args,
		}).then(v => v?.results||v?.message|| []);
	}, 300, {
		render: v => {
			opts.value = [
				...v.map(({ value, label, description }) => ({ value, label: label || tt(value), description })),
			];
		},
	});
let searchString = '';
function search(query?: string) {
	searchString = query || '';
	remoteMethod(query);
}

function focus() {
	if (searchString) { return; }
	if (opts.value.length) { return; }
	if (loading.value) { return; }
	if (waiting.value) { return; }
	remoteMethod('');
}
</script>

<style lang='less' scoped>
:deep(.form label) {
	margin-bottom: 0;
}
</style>
