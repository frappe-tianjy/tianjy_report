<template>
	<div class="text-container">{{ text }}</div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, reactive, watch } from 'vue';

import * as echarts from 'echarts';

interface Props{
	data:Record<string, any>[]
	options:Record<string, any>
}
const props = defineProps<Props>();
const text = computed(()=>{
	let content:string = props.options?.content||'';
	if (props.data.length===0){
		return content;
	}
	const regex = /{{([^}]+)}}/g;
	const results = [];
	let match;
    // eslint-disable-next-line no-cond-assign
    while (match = regex.exec(content)) {
        results.push({label:match[0], fieldname:match[1]});
    }
	results.forEach(item=>{
		const f = props.options.fields?.find(field=>field.fieldname === item.fieldname);
		const [data] = props.data;
		if (f){
			const isLink = f.fieldtype === 'Link'||f.fieldtype === 'Tree Select';
			let fieldname = isLink?`${f.fieldname}.title`:f.fieldname;
			content = content.replaceAll(item.label, __(data[fieldname]));
		}
	});
	return content;
});

</script>
<style scoped>
.text-container {
	word-break: break-all;
	white-space: break-spaces;
}
</style>
