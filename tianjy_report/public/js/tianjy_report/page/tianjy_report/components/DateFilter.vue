<template>
	<div>
		<div v-for="filter in filters">
			<CustomDateFilter 
				:dateFields="dateFields"
				:reportStartDate="reportStartDate"
				:reportEndDate="reportEndDate"
				:filter="filter"
				@change="changeFilter"
				@close="closeFilter"
			></CustomDateFilter>
		</div>
		<div class="btn-container">
			<ElButton @click="add">增加以一个过滤条件</ElButton>
			<ElButton @click="clear">清除过滤条件</ElButton>
		</div>
	</div>
</template>

<script setup lang='ts'>
import { ref, defineProps, defineEmits, watch,} from 'vue';
import CustomDateFilter from './CustomDateFilter.vue'
import type { DateFilter } from '../../type';
const props = defineProps<{
	options?: string;
	modelValue?: DateFilter[];
	reportEndDate?:string
	reportStartDate?:string
}>();
const emit = defineEmits<{	
	(event: 'update:modelValue', value: DateFilter[]): void;
}>();
const dateFields = ref<{fieldname:string, label:string}[]>([])
const filters = ref<[string, ...DateFilter][]>([]);
let filterIndex = 0
const DateTypeFields=[
	'Date', 'Datetime', 'Guigu Date'
]

function add(){
	if(!props.options){return;}
	filters.value.push([(filterIndex++).toString(), props.options, '', '', ''])
}
function clear(){
	filters.value=[]
	emit('update:modelValue', [])
}
watch(()=>props.modelValue,()=>{
	filters.value = props.modelValue?.map(item=>{
		return [(filterIndex++).toString(), ...item]
	})||[]
}, {immediate:true})
watch([()=>props.options], ()=>{
	if (!props.options){ return; }
	frappe.model.with_doctype(props.options, (doctype) => { 
		const meta = frappe.get_meta(props.options as string)!;
		dateFields.value = [
			...meta.fields.filter(item=>DateTypeFields.includes(item.fieldtype)).map(item=>({
				fieldname: item.fieldname,
				label: `${__(item.label)} (${item.fieldname})`,
			})),
			{ fieldname: 'creation', label: `${__('Created On')} (creation)`},
			{ fieldname: 'modified', label: `${__('Last Updated On')} (modified)` },
		]
	});
}, {immediate:true});

function changeFilter(filter:[string, ...DateFilter]){
	const index = filters.value.findIndex(item=>item[0] === filter[0])
	filters.value.splice(index, 1, filter)
	if(!filter[1]||!filter[2]||!filter[3]||!filter[4]){
		return;
	}
	const validFilter = getValidateFilter(filters.value)
	emit('update:modelValue', validFilter)
}
function closeFilter(filter:[string, ...DateFilter]){
	filters.value = filters.value.filter(item=>item[0] !== filter[0])
	const validFilter = getValidateFilter(filters.value)
	emit('update:modelValue', validFilter)
}
function getValidateFilter(filters:[string, ...DateFilter][]){
	const validFilter = filters.filter(item=>item[1]&&item[2]&&item[3]&&item[4])
									.map(item=>{
										const f = [...item]; 
										f.shift(); 
										return f;
									}) as DateFilter[]
	return validFilter
}
</script>

<style lang='less' scoped>
.btn-container{
	margin-top: 8px;
	display: flex;
	justify-content: space-between;
}
</style>
