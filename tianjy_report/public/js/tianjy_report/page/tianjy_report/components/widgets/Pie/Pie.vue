<template>
	<div ref="chartRef" class="chart"></div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, reactive, watch, onUnmounted } from 'vue';

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
	const yAxisF = props.options.yAxis?.fieldname;
	const series = [{
		'type': 'pie',
		radius:'50%',
		data:(props.data||[])?.map(item=>{
			const isLink = props.options.xAxis?.fieldtype === 'Link'||props.options.xAxis?.fieldtype === 'Tree Select';
			const label = isLink?__(item[`${xAxisF}.title`]):__(item[xAxisF]);
			const data = {
				value:item[yAxisF],
				name:label,
			};
			return data;
		}),
		emphasis: {
			itemStyle: {
			shadowBlur: 10,
			shadowOffsetX: 0,
			shadowColor: 'rgba(0, 0, 0, 0.5)',
			},
		},
	}];
	if (!props.data){ return {}; }
	const formatOptions={
		title: {
			text: props.options.title,
			left:'center',
		},
		color:['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de', '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc'],
		type:'Bar',
		toolbox: {
			show: true,
			feature: {
			saveAsImage: {},
			},
		},
		legend: {
			top:'bottom',
		},
		tooltip: {
			trigger: 'item',
		},
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
	window.addEventListener('resize', chart.resize);
	setOption();
});
onUnmounted(()=>{
	window.removeEventListener('resize', chart?.resize);
});
function valueFormatter(value) {
	return isNaN(value) ? value : value.toLocaleString();
}
</script>
<style scoped>
.chart {
	height: 20rem;
	border: 1px solid #e2e8f0;
	border-radius: 0.25rem;
	margin: 1.5rem 0;
}
</style>
