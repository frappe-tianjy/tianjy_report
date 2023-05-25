<template>
	<div ref="chartRef" class="chart"></div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, reactive, watch } from 'vue';

import * as echarts from 'echarts';

interface Props{
	data:Record<string, any>[]
	options:Record<string, any>
}
const props = defineProps<Props>();
const chartRef = ref(null);
let chart:any = null;

const formatOptions = computed(()=>{
	const xAxisF = props.options.xAxis?.fieldname;
	const xAxisData = (props.data||[])?.map(item=>{
		const isLink = props.options.xAxis?.fieldtype === 'Link'||props.options.xAxis?.fieldtype === 'Tree Select';
		return isLink?__(item[`${xAxisF}.title`]):__(item[xAxisF]);
	});
	const xAxis = {
                    'type': 'category',
					'name': __(props.options.xAxis?.label||'x轴'),
                    'data': xAxisData,
                };
	const yAxisArr = props.options.yAxis||[];
	const yAxis = {
		'type': 'value',
		'name': __(props.options.yAxis?.label||'y轴'),
	};
	const series = yAxisArr.map(yAxisF=>{
		const data=(props.data||[]).map(item=>item[yAxisF.fieldname]);
		return {
			data,
			'type': 'line',
			label:{
				show:true,
				position: 'top',
			},
		};
	});
	if (!props.data||xAxisData.length===0){ return {}; }
	const formatOptions={
		title: {
			text: props.options.title,
		},
		color:['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
		toolbox: {
				show: true,
				feature: {
				saveAsImage: {},
			},
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'cross',
				link:[{
					yAxisIndex:'all',
					xAxisIndex:'all',
				}],
			},
		},
		xAxis,
		yAxis,
		series,
	};
	return formatOptions;
});
watch(formatOptions, setOption, { deep: true });
function setOption() {
	chart?.setOption(formatOptions.value);
}

onMounted(() => {
	chart = echarts.init(chartRef.value, 'light', {
		renderer: 'canvas',
	});
	setOption();
});

function valueFormatter(value) {
	return isNaN(value) ? value : value.toLocaleString();
}
</script>
<style scoped>
.chart {
	height: 100%;
}
</style>
