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
	const yAxisF = props.options.yAxis?.[0]?.fieldname;
	const methodOption = props.options.method;
	let propsData = props.data||[]
	if (props.options.xAxis?.fieldtype === 'Date' || props.options.xAxis?.fieldtype==='Date Time'){
		propsData = propsData.sort((pre, next)=>pre[xAxisF]>next[xAxisF]?1:-1)
	}

	const xAxisDataSet:Set<string> = new Set
	let xAxisData:string[] = []
	if (methodOption === 'Sum'||methodOption === 'Count'){
		propsData.forEach(item=>{
			const isLink = props.options.xAxis?.fieldtype === 'Link'||props.options.xAxis?.fieldtype === 'Tree Select';
			const value = isLink?item[`${xAxisF}.title`]:item[xAxisF]
			xAxisDataSet.add(__(value))
		});
		xAxisData = Array.from(xAxisDataSet)
	}else{
		xAxisData = propsData.map(item=>{
			const isLink = props.options.xAxis?.fieldtype === 'Link'||props.options.xAxis?.fieldtype === 'Tree Select';
			return isLink?__(item[`${xAxisF}.title`]):__(item[xAxisF]);
		});
	}

	let data = []
	if(methodOption === 'Sum'){
		data = xAxisData.map(x=>{
			const filterData = propsData.filter(d=>{
				const isLink = props.options.xAxis?.fieldtype === 'Link'||props.options.xAxis?.fieldtype === 'Tree Select';
				const value = isLink?d[`${xAxisF}.title`]:d[xAxisF]
				return value === x
			})
			return {
				value:filterData.reduce((pre,next)=>pre+(next[yAxisF]||0), 0),
				name:`${x}(求和)`,
			}
		})
	}else if(methodOption === 'Count'){
		data = xAxisData.map(x=>{
			const filterData = propsData.filter(d=>{
				const isLink = props.options.xAxis?.fieldtype === 'Link'||props.options.xAxis?.fieldtype === 'Tree Select';
				const value = isLink?d[`${xAxisF}.title`]:d[xAxisF]
				return value === x
			})
			return {
				value:filterData.length,
				name:`${x}(个数)`,
			}
		})
	}else {
		data=propsData.map(item=>{
			const isLink = props.options.xAxis?.fieldtype === 'Link'||props.options.xAxis?.fieldtype === 'Tree Select';
			const label = isLink?__(item[`${xAxisF}.title`]):__(item[xAxisF]);
			const data = {
				value:item[yAxisF],
				name:label,
			};
			return data;
		});
	}

	const series = [{
		'type': 'pie',
		radius:'50%',
		data,
		label:{
			normal:{
				show:true,
				position:'inner',
				textStyle : {
					fontWeight : 300,
					fontSize : 12,
				},
				formatter:'{d}%',
            },
		},
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
	chart?.setOption(formatOptions.value, true);
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
}
</style>
