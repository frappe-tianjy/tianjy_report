<template>
	<div class="table-container">
		<el-table :data="tableData" style="width: 100%" height="100%">
			<el-table-column
				v-for="(col, index) in columns"
				:prop="col.fieldname"
				:label="tt(col.label)"
				:width="index===columns.length-1?undefined:180" />
		</el-table>
	</div>
</template>

<script setup lang='ts'>
import { ref, defineProps, defineEmits, computed, watch } from 'vue';
const tt=__;

interface Props{
	data:Record<string, any>[]
	options:Record<string, any>
}
const props = defineProps<Props>();
interface Emit{

}
const emit = defineEmits<Emit>();
const columns = computed(()=>props.options?.columns||[]);
const tableData = computed(()=>props.data.map(item=>{
		const d = {};
		props.options?.columns?.forEach(each=>{
			const isLink = each.fieldtype === 'Link'||each.fieldtype === 'Tree Select';
			d[each.fieldname] = isLink?__(item[`${each.fieldname}.title`]):__(item[each.fieldname]);
		});
		return d;
	}));
</script>

<style lang='less' scoped>
.table-container {
	height: 20rem;
	border: 1px solid #e2e8f0;
	border-radius: 0.25rem;
	margin: 1.5rem 0;
}
</style>
