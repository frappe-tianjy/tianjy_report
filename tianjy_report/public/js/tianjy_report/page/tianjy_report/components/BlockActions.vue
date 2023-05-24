<template>
	<el-popover
		width="180"
		ref="popoverRef"
		:virtual-ref="blockRef"
		trigger="click"
		virtual-triggering
		placement="right-start">
		<div>
			<slot />
		</div>
	</el-popover>
</template>

<script setup lang="ts">
import { ref, defineExpose } from 'vue';

const props = defineProps({
	blockRef: Object,
	actions: {
		type: Array,
		default: () => [],
	},
});
const popoverRef = ref();
defineExpose({popoverRef});
</script>
