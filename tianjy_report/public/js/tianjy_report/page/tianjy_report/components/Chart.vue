<template>
	<node-view-wrapper :class="{'draggable-item':isEditable}">
		<GripVertical
			v-if="isEditable"
			class="drag-handle"
			contenteditable="false"
			draggable="true"
			data-drag-handle
			:size="16"></GripVertical>
		<node-view-content class="content">
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
		</node-view-content>
	</node-view-wrapper>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { ref } from 'vue';

import { NodeViewWrapper, nodeViewProps} from '@tiptap/vue-3';
import { GripVertical} from 'lucide-vue-next';

import ChartBlock from './ChartBlock.vue';

const props = defineProps(nodeViewProps);
const isEditable = ref<boolean>(false);
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

	.drag-handle {
		flex: 0 0 auto;
		position: relative;
		width: 1rem;
		height: 1rem;
		top: 0.3rem;
		margin-right: 0.5rem;
		margin-bottom: 4px;
		cursor: grab;
	}

	.content {
		flex: 1 1 auto;
	}
}
</style>
