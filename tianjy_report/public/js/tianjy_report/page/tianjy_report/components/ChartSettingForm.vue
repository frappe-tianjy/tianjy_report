<template>
	<div class="form">
		<ElForm label-position="top" @submit.prevent>
			<el-form-item label="单据">
				<DocSelect v-model="doctype" @change="changeDoctype"></DocSelect>
			</el-form-item>
			<el-form-item label="图表类型">
				<ElSelect v-model="chartType" :teleported="false"
					@change="changeType">
					<ElOption value="Bar" label="柱状图"></ElOption>
					<ElOption value="Table" label="表格"></ElOption>
					<ElOption value="Pie" label="饼状图"></ElOption>
					<ElOption value="Line" label="折线图"></ElOption>
					<ElOption value="Text" label="文本"></ElOption>
				</ElSelect>
			</el-form-item>
			<el-form-item label="过滤器">
				<Filter v-model="filter" :options="doctype"
					@change="changeFilter"></Filter>
			</el-form-item>
			<component
				v-if="chartType"
				:is="widgets.getOptionComponent(chartType)"
				:key="chartType" />
			<el-form-item>
				<el-button type="danger" @click="onDelete">删除</el-button>
			</el-form-item>
		</ElForm>
	</div>
</template>

<script setup lang='ts'>
import { ref, defineProps, defineEmits, reactive, watch, inject, Ref } from 'vue';

import { ChartOptions, ChartProvide } from '../../type';

import DocSelect from './DocSelect.vue';
import widgets from './widgets/widgets';
import Filter from './Filter.vue';

interface Props{

}
const props = defineProps<Props>();
interface Emit{
	(event: 'remove'): void;
}
const emit = defineEmits<Emit>();
const chart = inject<ChartProvide>('chart');
const doctype = ref<string>();
const chartType = ref<string>();
const filter = ref<any>();
watch(()=>chart?.doc.filter, ()=>{
	filter.value = chart?.doc.filter;
});
watch(()=>chart?.doc.source_doctype, ()=>{
	doctype.value = chart?.doc.source_doctype||'';
});
watch(()=>chart?.doc.type, ()=>{
	chartType.value = chart?.doc.type||'';
});

function changeDoctype(v:string){
	if (!chart){ return; }
	chart?.updateQuery(v);
}

function changeType(v:string){
	if (!chart){ return; }
	chart.doc.type = v;
}
function changeFilter(v:any){
	if (!doctype.value){ return; }
	chart?.updateQuery(doctype.value, v);
}
async function onDelete(){
	const isSuccess = await chart?.delete?.();
	if (isSuccess){
		emit('remove');
	}
}
</script>

<style lang='less' scoped>
:deep(.form label) {
	margin-bottom: 0;
}
</style>
