<template>
	<div v-if="isEditable" class="tools">
		<GripVertical
			class="drag-handle"
			contenteditable="false"
			draggable="true"
			data-drag-handle
			:size="16"></GripVertical>
		<BlockActions :editable="isEditable" v-slot="slotProps">
			<ChartSettingForm @remove="emit('remove')" :visible="slotProps.visible">
			</ChartSettingForm>
		</BlockActions>
	</div>
	<div v-loading="chart?.loading" class="chart-container" ref="blockRef">
		<component
			v-if="isShowChart"
			ref="widget"
			:is="widgets.getComponent(chart?.doc?.type)"
			:data="chart?.data"
			:options="chart?.doc.options"
			:isEditable="isEditable"
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
</template>

<script setup lang="ts">
import { computed, inject, provide, ref, unref, watch, defineProps, reactive, type Ref } from 'vue';

import { ClickOutside as vClickOutside } from 'element-plus';

import { GripVertical, Settings} from 'lucide-vue-next';

import { ChartOptions, ChartProvide } from '../../type';

import { createChart, default as useChart } from './helper';
import widgets from './widgets/widgets';
import BlockActions from './BlockActions.vue';
import ChartSettingForm from './ChartSettingForm.vue';

const emit = defineEmits(['setChartName', 'remove']);
interface Props {
	chartName?: string
	nodeViewProps: any
	isEditable: boolean
}
const props = defineProps<Props>();

const blockRef = ref(null);
const searchParams = new URLSearchParams(location.search);
const reportName = searchParams.get('name');
const mode = searchParams.get('mode');
const isPersistence = inject<Ref<boolean>>('isPersistence');
const reportStartDate = inject<Ref<string>>('reportStartDate');
const reportEndDate = inject<Ref<string>>('reportEndDate');

const chart = reactive<ChartProvide>({
	data: [],
	columns: [],
	loading: true,
	options: {},
	autosave: false,
	deleting: false,
	doc: {
		name: undefined,
		type: undefined,
		options: {},
		filter: undefined,
		source_doctype: undefined,
		sources: [],
		reportBlockName: undefined,
	},
});

provide('chart', chart);

const isShowChart = computed(() => {
	const type = chart?.doc?.type;
	const source_doctype = chart?.doc?.source_doctype;
	return type === 'Text Editor' || type === 'System Chart' ||type === 'Superset'|| (type && source_doctype);
});
function getTimeout(infoEntry: IntersectionObserverEntry) {
	setTimeout(async () => {
		if (!props.chartName) {
			const chartName = await createChart(reportName || '', mode);
			emit('setChartName', chartName);
			const getChart = useChart(chart, reportName, chartName, mode, isPersistence?.value, reportStartDate?.value, reportEndDate?.value);
			Object.assign(chart, getChart);
		} else {
			const getChart = useChart(chart, reportName, props.chartName, mode, isPersistence?.value, reportStartDate?.value, reportEndDate?.value);
			Object.assign(chart, getChart);
		}
		const blockType = mode === 'template' ? 'Tianjy Report Template Block' : 'Tianjy Report Block';
		frappe.model.with_doctype(blockType, () => {
			const hasWrite = frappe.perm.has_perm(blockType, 0, 'write');
			if (hasWrite) {
				chart?.enableAutoSave?.();
			}
		});
	}, 500);
}

function observerCallback(entries: IntersectionObserverEntry[]) {
	entries.reverse().forEach(entry => {
		if (entry.isIntersecting) {
			location.hash = `#${entry.target.id}`;
			getTimeout(entry);
		} else {
		}
	});
}

const observer = new IntersectionObserver(observerCallback, {
	threshold: 0.1,
	root: document.body,
});

watch(blockRef, () => {
	if (!blockRef.value) { return; }
	observer.observe(blockRef.value);
}, { deep: true });

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
}

.tools {
	margin-bottom: 1.5rem;
	display: flex;
	justify-content: space-between;
	padding: 0 20px;

	.drag-handle {
		cursor: grab;
	}
}
</style>
