<template>
	<el-popover
		:popper-style="{'maxWidth':'450px', 'width':'auto', 'maxHeight':'90%', 'overflowY':'auto'}"
		:visible="visible"
		trigger="click"
		:offset="-5"
		placement="right-start">
		<template #reference>
			<Settings class="setting" @click="clickSetting" :size="16"></Settings>
		</template>
		<div>
			<div class="header">
				<X class="close" :size="16" @click="close"></X>
			</div>
			<slot />
		</div>
	</el-popover>
</template>

<script setup lang="ts">
import { ref, defineExpose, watch } from 'vue';

import { Settings, X} from 'lucide-vue-next';

const props = defineProps({
	editable:Boolean,
});
const visible = ref<boolean>(false);
function clickSetting(){
	visible.value = !visible.value;
}
function close(){
	visible.value=false;
}
</script>
<style scoped lang="less">
.header {
	display: flex;
	justify-content: flex-end;
}

.setting {
	cursor: pointer;
}

.close {
	cursor: pointer;
}
</style>
