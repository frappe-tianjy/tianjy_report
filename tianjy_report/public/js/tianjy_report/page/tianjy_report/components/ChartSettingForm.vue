<template>
	<div class="form">
		<ElForm label-position="top" @submit.prevent>
			<el-form-item label="图表类型">
				<ElSelect v-model="chartType"
					@change="changeType">
					<ElOption v-for="op in chartTypes" :value="op.value"
						:label="op.label"></ElOption>
				</ElSelect>
			</el-form-item>
			<el-form-item label="单据"
				v-if="chartType!=='System Chart'&&chartType!=='Text Editor'&&chartType!=='Superset'">
				<DocSelect v-model="doctype" @change="changeDoctype"></DocSelect>
			</el-form-item>
			<el-form-item label="过滤器"
				v-if="chartType!=='System Chart'&&chartType!=='Text Editor'&&chartType!=='Superset'">
				<Filter :visible="visible" v-model="filter" :options="doctype"
					@change="changeFilter"></Filter>
			</el-form-item>
			<el-form-item label="日期随动过滤器"
				v-if="chartType!=='System Chart'&&chartType!=='Text Editor'&&chartType!=='Superset'">
				<DateFilter
				 	v-model="dateFilter" 
					:options="doctype"
					:reportEndDate="reportEndDate"
					:reportStartDate="reportStartDate"
				></DateFilter>
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
import { ref, defineProps, defineEmits, reactive, watch, inject, computed, onMounted, type Ref } from 'vue';

import { ChartOptions, ChartProvide } from '../../type';

import DocSelect from './DocSelect.vue';
import widgets from './widgets/widgets';
import Filter from './Filter.vue';
import DateFilter from './DateFilter.vue'
interface Props{
	visible:boolean
}
const props = defineProps<Props>();
interface Emit{
	(event: 'remove'): void;
}
const emit = defineEmits<Emit>();
const chart = inject<ChartProvide>('chart');
const reportStartDate = inject<Ref<string>>('reportStartDate');
const reportEndDate = inject<Ref<string>>('reportEndDate');
const doctype = ref<string>();
const chartType = ref<string>();
const filter = ref<any>();
const chartTypes = ref<{value:string, label:string}[]>([]);
watch(()=>chart?.doc.filter, ()=>{
	filter.value = chart?.doc.filter;
}, {immediate:true});

const dateFilter = computed({
	set(v:any){
		if (!doctype.value){ return; }
		chart?.updateDateQuery?.(doctype.value, v);
	},
	get(){
		return chart?.doc.dateFilter
	}
})
watch(()=>chart?.doc.source_doctype, ()=>{
	doctype.value = chart?.doc.source_doctype||'';
}, {immediate:true});
watch(()=>chart?.doc.type, ()=>{
	chartType.value = chart?.doc.type||'';
}, {immediate:true});

onMounted(async()=>{
	chartTypes.value = [
		{value:'Bar', label:'柱状图'},
		{value:'Table', label:'表格'},
		{value:'Pie', label:'饼状图'},
		{value:'Line', label:'折线图'},
		{value:'Text', label:'文本'},
		{value:'System Chart', label:'系统图表'},
		{value:'Text Editor', label:'富文本'},
	];
	fetch(`/api/resource/${'Guigu Superset Chart'}`).then(function(response) {
		if (response.ok) {
			chartTypes.value.push({
				value:'Superset', label:'Superset',
			});
		} else {
			console.log(`Doctype does not exist.`);
		}
		})
		.catch(function(error) {
			console.log('Error occurred while checking Doctype:', error);
		});
});

function changeDoctype(v:string){
	if (!chart){ return; }
	chart.doc.options = {};
	chart?.updateQuery?.(v);
	chart?.updateDateQuery?.(v);
}

function changeType(v:string){
	if (!chart){ return; }
	chart.doc.type = v;
}
function changeFilter(v:any){
	if (!doctype.value){ return; }
	chart?.updateQuery?.(doctype.value, v);
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
