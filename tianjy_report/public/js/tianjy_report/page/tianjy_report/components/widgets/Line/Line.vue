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
	const xLabelOption = props.options.xLabel;
	const yLabelOption = props.options.yLabel;
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
	const xAxis = {
                    'type': 'category',
					'name': __(xLabelOption||props.options.xAxis?.label||'x轴'),
                    'data': xAxisData,
                };
	const yAxisArr:{label:string, fieldname:string, fieldtype:string}[] = props.options.yAxis||[];
	const yLabel = yAxisArr.length===1?yAxisArr[0]?.label:'';
	let yAxisLabel = ''
	switch(methodOption){
		case 'Sum': yAxisLabel = '合计';break;
		case 'Count': yAxisLabel = '个数';break;
		default: yAxisLabel = __(yLabelOption||yLabel||'值')
	}
	const yAxis = {
		'type': 'value',
		'name': yAxisLabel,
	};
	const series = yAxisArr.map(yAxisF=>{
		let data = []
		if(methodOption === 'Sum'){
			data = xAxisData.map(x=>{
				const filterData = propsData.filter(d=>{
					const isLink = props.options.xAxis?.fieldtype === 'Link'||props.options.xAxis?.fieldtype === 'Tree Select';
					const value = isLink?d[`${xAxisF}.title`]:d[xAxisF]
					return value === x
				})
				return filterData.reduce((pre,next)=>pre+(next[yAxisF.fieldname]||0), 0)
			})
		}else if(methodOption === 'Count'){
			data = xAxisData.map(x=>{
				const filterData = propsData.filter(d=>{
					const isLink = props.options.xAxis?.fieldtype === 'Link'||props.options.xAxis?.fieldtype === 'Tree Select';
					const value = isLink?d[`${xAxisF}.title`]:d[xAxisF]
					return value === x
				})
				return filterData.length
			})
		}else {
			data=propsData.map(item=>item[yAxisF.fieldname]);
		}
		return {
			data,
			'type': 'line',
			name:__(yAxisF.label),
			label:{
				show:true,
				position: 'top',
			},
		};
	});
	const legend = {
		top:'bottom',
		data:yAxisArr.map(item=>__(item.label)),
	};
	if (!props.data||xAxisData.length===0){ return {}; }
	const formatOptions={
		title: {
			text: props.options.title,
			left:'center',
		},
		legend,
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
