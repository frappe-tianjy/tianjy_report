<template>
	<div ref="tableContainerRef" class="table-container">
		<h4 class="title">{{ props.options.title }}</h4>
		<el-table border :data="tableData" style="width: 100%" height="100%">
			<el-table-column
				v-for="(col, index) in columns"
				:prop="col.fieldname"
				:label="tt(col.label)"
				:width="index===columns.length-1?(useWidth?col.size:undefined):col.size" />
		</el-table>
	</div>
</template>

<script setup lang='ts'>
import { ref, defineProps, defineEmits, computed, watch, inject, type Ref } from 'vue';
import type { ChartProvide } from '../../../../type';
import { ElTable, ElTableColumn } from 'element-plus';

const tt=__;

interface Props{
	data:Record<string, any>[]
	options:Record<string, any>
}
const props = defineProps<Props>();

const chart = inject<ChartProvide>('chart');
const tableContainerRef = ref<HTMLDivElement>()
const columns:Ref<{label:string, size?:string, fieldname:string}[]> = computed(()=>(props.options?.columns||[]).filter((item:any)=>{
	const field = fields.value.find(f=>f.fieldname === item.fieldname)
	return Boolean(field)
}));

const fields = ref<locals.DocField[]>([]);
const doctype = computed(()=>chart?.doc.source_doctype);
const maxWidth = computed(()=>tableContainerRef.value?.offsetWidth||0)
const useWidth = computed(()=>{
	const sumWidth = columns.value.map(item=>parseFloat(item.size||'0')).reduce((pre,next)=>pre+next, 0);
	return sumWidth>maxWidth.value
})
watch(doctype, async ()=>{
	if (!doctype.value){ fields.value=[]; return; }
	await new Promise(r => frappe.model.with_doctype(doctype.value!, r));
	const f = frappe.get_doc('DocType', doctype.value)?.fields || [];
	fields.value = f
}, {immediate:true});

const tableData = computed(()=>props.data.map(item=>{
		const d:any = {};
		props.options?.columns?.forEach((each:any)=>{
			const field = fields.value.find(f=>f.fieldname === each.fieldname)
			if(!field){
				return 
			}
			const isLink = field.fieldtype === 'Link'||field.fieldtype === 'Tree Select';
			if(isLink){
				d[field.fieldname] = __(item[`${field.fieldname}.title`])
			}else if(field.fieldtype === 'Guigu Date'){
				d[field.fieldname] = formatGuiguDate(item[field.fieldname], field.options)
			}else{
				d[field.fieldname] = __(item[field.fieldname]);
			}
		});

		return d;
	}));

function formatGuiguDate(value:string, options?:string){
	if (!value || typeof value !== 'string') { return value; }
	const type = options?.toLowerCase() || 'month';
	let lang = frappe.boot.user?.language || 'en';
	switch (type) {
		case 'week':
			return moment(value).format(`gggg-ww[${lang === 'zh' ? '周' : 'week'}]`);
		case 'month':
			return moment(value).format('YYYY-MM');
		case 'year':
			return moment(value).format('YYYY');
		case 'quarter':
			return `${moment(value).format('YYYY')}-${moment(value).quarter()}季度`;
		default: return '';
	}
}
</script>

<style lang='less' scoped>
.table-container {
	display: flex;
	flex-direction: column;
	// height: 20rem;
	border: 1px solid #e2e8f0;
	border-radius: 0.25rem;
}

.title {
	padding: 4px 8px;
	text-align: center;
}
</style>
