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
	const xAxisData = (props.data||[])?.map(item=>item[xAxisF]);
	const xAxis = {
                    'type': 'category',
                    'data': xAxisData,
                };
	const yAxisF = props.options.yAxis?.fieldname;
	const yAxis = {'type': 'value'};
	const series = [{
		data:(props.data||[])?.map(item=>item[yAxisF]),
		'type': 'bar',
	}];
	if (!props.data||xAxisData.length===0){ return {}; }
	const formatOptions={
		type:'Bar',
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
