<template>
	<el-popover
		:popper-style="{'maxWidth':'450px', 'width':'auto', 'maxHeight':'90%', 'overflowY':'auto'}"
		ref="popoverRef"
		:virtual-ref="blockRef"
		:disabled="!editable"
		trigger="click"
		virtual-triggering
		offset="-5"
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
