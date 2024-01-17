<template>
	<div class="filter_container">
		<ElSelect class="select" :modelValue="filter[2]" filterable @change="fieldChange">
			<ElOption
				v-for="option in dateFields"
				:key="option.fieldname"
				:label="option.label"
				:value="option.fieldname">
			</ElOption>
		</ElSelect>
		<ElSelect class="operator" :modelValue="filter[3]" @change="operatorChange">
			<ElOption
				v-for="option in DateOperator"
				:key="option"
				:label="option"
				:value="option">
			</ElOption>
		</ElSelect>
		<ElSelect class="value" :modelValue="filter[4]" @change="valueChange">
			<ElOption
				v-for="option in valueOptions"
				:key="option.value"
				:label="option.label"
				:value="option.value">
			</ElOption>
		</ElSelect>
		<ElIcon class="close" @click="close" :size="16" ><Close /></ElIcon>
	</div>

</template>

<script setup lang='ts'>
import { ref, defineProps, defineEmits, watch, computed } from 'vue';
import type { DateFilter } from '../../type';
import { Close } from '@element-plus/icons-vue';
import { ElIcon, ElForm, ElSelect, ElOption } from 'element-plus';

const props = defineProps<{
	filter: [string, ...DateFilter];
	reportEndDate?:string
	reportStartDate?:string
	dateFields:{fieldname:string, label:string}[]
}>();
const emit = defineEmits<{	
	(event: 'update:modelValue', value: any): void;
	(event: 'change', value:[string, ...DateFilter] ): void;
	(event: 'close', value:[string, ...DateFilter] ): void;
}>();
const valueOptions = computed(()=>{
	const dateOptions = []
	dateOptions.push({
		label:`${__('Start Date')}(${props.reportStartDate||'无'})`,
		value:'start_date'
	})
	dateOptions.push({
		label:`${__('End Date')}(${props.reportEndDate||'无'})`,
		value:'end_date'
	})
	return dateOptions
})

const DateOperator=[
	'=', '>','<','>=','<='
]

function fieldChange(field:string){
	const filter = [...props.filter] as [string, ...DateFilter]
	filter[2] = field
	emit('change', filter)
}
function operatorChange(operator:string){
	const filter = [...props.filter] as [string, ...DateFilter]
	filter[3] = operator
	emit('change', filter)
}
function valueChange(value:string){
	const filter = [...props.filter] as [string, ...DateFilter]
	filter[4] = value
	emit('change', filter)
}
function close(){
	emit('close', props.filter)
}
</script>

<style lang='less' scoped>
.filter_container{
	display: flex;
	align-items: center;
	margin-bottom:8px;
	.select{
		margin-right: 15px;
	}
	.operator{
		margin-right: 15px;
		max-width: 25%;
	}
	.value{
		margin-right: 15px;
	}
	.close{
		max-width: 25%;
		cursor: pointer;
	}
}
</style>
