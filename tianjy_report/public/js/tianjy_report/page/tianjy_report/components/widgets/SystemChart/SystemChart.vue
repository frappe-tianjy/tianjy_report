<template>
	<div ref="chartRef" class="chart"></div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, reactive, watch, onUnmounted } from 'vue';

interface Props{
	data:Record<string, any>[]
	options:Record<string, any>
}
const props = defineProps<Props>();
const chartRef = ref<HTMLDivElement|null>(null);

watch([props.options, chartRef], ()=>{
	if (!props.options.chart){ return; }
	if (!chartRef.value){ return; }
	$(chartRef.value).empty();
	frappe.widget.make_widget({
			chart_name:props.options.chart,
			widget_type: 'chart',
			container: chartRef.value,
			height: null,
			options: {
				allow_delete:false,
				allow_create:false,
				allow_edit:false,
				allow_hiding:false,
				allow_resize:false,
				allow_sorting:false,
			},
		});
}, {immediate:true, deep:true});
</script>
<style scoped>
.chart {
	height: 440px;
	border: 1px solid #e2e8f0;
	border-radius: 0.25rem;
}
</style>
