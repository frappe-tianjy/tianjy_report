<template>
	<node-view-wrapper>
		<Suspense>
			<ChartBlock
				:chartName="node.attrs.chart_name"
				:data="node.attrs.data"
				:chart_type="node.attrs.chart_type"
				:nodeViewProps="props"
				@setChartName="updateAttributes({ chart_name: $event })"
				@remove="deleteNode()" />
		</Suspense>
	</node-view-wrapper>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';

import ChartBlock from './ChartBlock.vue';
const props = defineProps(nodeViewProps);
</script>
