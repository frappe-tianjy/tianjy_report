<template>
	<el-popover
		width="180"
		ref="popoverRef"
		:virtual-ref="blockRef"
		:disabled="!editable"
		trigger="click"
		virtual-triggering
		placement="right-start">
		<div>
			<slot />
		</div>
	</el-popover>
</template>

<script setup lang="ts">
import { ref, defineExpose, watch } from 'vue';

const props = defineProps({
	blockRef: Object,
	actions: {
		type: Array,
		default: () => [],
	},
	editable:Boolean,
});
watch(()=>props.editable, ()=>console.log(props.editable), {immediate:true});
const popoverRef = ref();
defineExpose({popoverRef});
</script>
