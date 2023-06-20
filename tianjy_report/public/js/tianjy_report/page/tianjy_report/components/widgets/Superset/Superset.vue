<template>
	<div ref="chartRef" class="chart"></div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, reactive, watch, onUnmounted } from 'vue';

import { embedDashboard } from '@superset-ui/embedded-sdk';

interface Props{
	data:Record<string, any>[]
	options:Record<string, any>
}
const props = defineProps<Props>();
const chartRef = ref<HTMLDivElement|null>(null);

watch([props.options, chartRef], async ()=>{
	if (!props.options.chart){ return; }
	if (!chartRef.value){ return; }
	$(chartRef.value).empty();
	const token = await frappe.call<{message:string}>({
			method: 'guigu_superset.superset.guest_token.get_guest_token',
			args: { chart:props.options.chart},
		});
	const setting = await frappe.db.get_doc('Guigu Superset Setting');
	if (!setting.superset_domain){ return; }
	embedDashboard({
		id: props.options.chart,
		supersetDomain: setting.superset_domain,
		mountPoint: chartRef.value,
		fetchGuestToken: async() => token?.message||'',
		dashboardUiConfig: {
			filters:{visible:false, expanded:false}, hideChartControls:true,
			hideTab:true, hideTitle:true,
		},
	});
}, {immediate:true, deep:true});
</script>
<style scoped lang="less">
.chart {
	height: 450px;
	border: 1px solid #e2e8f0;
	border-radius: 0.25rem;

	:deep(iframe) {
		width: 100%;
		height: 100%;
		border: 0;
	}
}
</style>
