<template>
	<node-view-wrapper :class="{'draggable-item':isEditable}">
		<div class="content">
			<Suspense>
				<ChartBlock
					:chartName="node.attrs.chart_name"
					:data="node.attrs.data"
					:chart_type="node.attrs.chart_type"
					:isEditable="isEditable"
					:nodeViewProps="props"
					@setChartName="updateAttributes({ chart_name: $event })"
					@remove="deleteNode()" />
			</Suspense>
		</div>
	</node-view-wrapper>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { ref } from 'vue';

import { NodeViewWrapper, nodeViewProps} from '@tiptap/vue-3';

import ChartBlock from './ChartBlock.vue';

const props = defineProps(nodeViewProps);
const isEditable = ref<boolean>(props.editor.isEditable);
props.editor.on('update', ({ editor }) => {
  isEditable.value = props.editor.isEditable;
});

</script>
<style scoped lang="less">
.draggable-item {
	display: flex;
	flex-direction: column;
	padding: 0.5rem;
	margin: 0.5rem 0;
	border-radius: 0.5rem;
	background: white;
	box-shadow:
		0 0 0 1px rgba(0, 0, 0, 0.05),
		0px 10px 20px rgba(0, 0, 0, 0.1),
	;

	.content {
		flex: 1 1 auto;
	}
}
</style>
