<template>
	<div v-loading="chart?.loading" class="chart-container" ref="blockRef"
		v-click-outside="onClickOutside">
		<component
			v-if="type&&source_doctype"
			ref="widget"
			:is="widgets.getComponent(chart?.doc?.type)"
			:data="chart?.data"
			:options="chart?.doc.options"
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
			<div class="mb-1 w-[10rem] text-gray-400">请配置图表</div>
		</div>
	</div>
	<div>
		<BlockActions :editable="nodeViewProps.editor.isEditable"
			:blockRef="blockRef" ref="actionsRef">
			<ChartSettingForm @remove="emit('remove')"></ChartSettingForm>
		</BlockActions>
	</div>
</template>

<script setup lang="ts">
import { computed, inject, provide, ref, unref, watch, defineProps, reactive } from 'vue';

import { ClickOutside as vClickOutside } from 'element-plus';

import { ChartOptions, ChartProvide } from '../../type';

import { createChart, default as useChart } from './helper';
import widgets from './widgets/widgets';
import BlockActions from './BlockActions.vue';
import ChartSettingForm from './ChartSettingForm.vue';
const emit = defineEmits(['setChartName', 'remove']);
interface Props{
	chartName?: string
	nodeViewProps:any
}
const props = defineProps<Props>();

const blockRef = ref(null);
const actionsRef = ref(null);
const searchParams = new URLSearchParams(location.search);
const reportName = searchParams.get('name');
const mode = searchParams.get('mode');
const isPersistence = inject('isPersistence');
const chart=reactive<ChartProvide>({
	data: [],
	columns: [],
	loading: true,
	options: {},
	autosave: false,
	deleting:false,
	doc: {
		name: undefined,
		type: undefined,
		options: {},
		filter:undefined,
		source_doctype:undefined,
		sources:[],
		reportBlockName:undefined,
	},
});

provide('chart', chart);
function onClickOutside () {
	actionsRef.value?.popoverRef?.delayHide?.();
}

const type=computed(()=>chart?.doc?.type);
const source_doctype=computed(()=>chart?.doc?.source_doctype);
function getTimeout(infoEntry: IntersectionObserverEntry) {
    setTimeout(async () => {
		if (!props.chartName) {
			const chartName = await createChart(reportName||'', mode);
			emit('setChartName', chartName);
			const getChart = useChart(chart, reportName, chartName, mode, isPersistence.value);
			Object.assign(chart, getChart);
		} else {
			const getChart = useChart(chart, reportName, props.chartName, mode, isPersistence.value);
			Object.assign(chart, getChart);
		}
		chart?.enableAutoSave?.();
    }, 500);
}

function observerCallback(entries: IntersectionObserverEntry[]) {
      entries.reverse().forEach(entry => {
        if (entry.isIntersecting) {
          location.hash=`#${entry.target.id}`;
          getTimeout(entry);
        } else {
        }
      });
}

const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.1,
      root: document.body,
});

watch(blockRef, ()=>{
	if (!blockRef.value){ return; }
	observer.observe(blockRef.value);
}, {deep:true});

</script>
<style scoped lang="less">
.placeholder {
	height: 20rem;
	width: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid #e2e8f0;
	border-radius: 0.25rem;
	margin: 1.5rem 0;
}
</style>
