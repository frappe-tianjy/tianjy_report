<template>
	<div class="chart-container" ref="blockRef" v-click-outside="onClickOutside">
		<component
			v-if="chart?.doc?.type"
			ref="widget"
			:is="widgets.getComponent(chart?.doc?.type)"
			:data="chart.data"
			:options="chart.doc.options"
			:key="JSON.stringify([chart?.data])">
			<template #placeholder>
				<div class="relative h-full w-full">
					配置不正确的组件
				</div>
			</template>
		</component>
		<div
			v-else
			class="placeholder">
			<div class="mb-1 w-[10rem] text-gray-400">Select a query</div>
		</div>
		<BlockActions :blockRef="blockRef" ref="actionsRef">
			<ChartSettingForm @remove="emit('remove')"></ChartSettingForm>
		</BlockActions>
	</div>
</template>

<script setup lang="ts">
import { computed, inject, provide, ref, unref, watch, defineProps } from 'vue';

import { ClickOutside as vClickOutside } from 'element-plus';

import { ChartOptions, ChartProvide } from '../../type';

import { createChart, default as useChart } from './helper';
import widgets from './widgets/widgets';
import BlockActions from './BlockActions.vue';
import ChartSettingForm from './ChartSettingForm.vue';
const emit = defineEmits(['setChartName', 'remove']);
interface Props{
	chartName?: string
}
const props = defineProps<Props>();

const blockRef = ref(null);
const actionsRef = ref(null);
const searchParams = new URLSearchParams(location.search);
const reportName = searchParams.get('name');
const mode = searchParams.get('mode');

let chart:ChartProvide|null = null;
if (!props.chartName) {
	const chartName = await createChart(reportName||'', mode);
	emit('setChartName', chartName);
	chart = useChart(chartName, mode);
} else {
	chart = useChart(props.chartName, mode);
}
chart?.enableAutoSave();
provide('chart', chart);

function onClickOutside () {
	actionsRef.value?.popoverRef?.delayHide?.();
}
</script>
<style scoped lang="less">
.chart-container {
	height: 20rem;
	position: relative;
	border: 1px solid #e2e8f0;
	border-radius: 0.25rem;
	margin: 1.5rem 0;
}

.placeholder {
	height: 100%;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>
