<template>
	<div>
		<el-form
			class="form"
			ref="formRef"
			:model="form"
			@submit.prevent
			:rules="rules">
			<el-form-item label="标题" prop="title">
				<el-input v-model="form.title" @change="changeTitle" />
			</el-form-item>
			<el-form-item label="列" prop="columns">
				<ElSelect v-model="form.columns" multiple
					@change="changeColumns">
					<ElOption v-for="f in fields"
						:value="f.fieldname"
						:label="tt(f.label)">
					</ElOption>
				</ElSelect>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang='ts'>
import { ref, defineProps, defineEmits, reactive, watch, inject, computed } from 'vue';

import type { FormInstance, FormRules } from 'element-plus';

import type { ChartOptions, ChartProvide } from '../../../../type';
import { notValueField } from '../../helper';

const formRef = ref<FormInstance>();
const tt=__;
interface Props{

}
const props = defineProps<Props>();
interface Emit{
	(event: 'remove'): void;
}
const emit = defineEmits<Emit>();
const chart = inject<ChartProvide>('chart');
const doctype = computed(()=>chart?.doc.source_doctype);
const form = reactive({
  title: chart?.doc.options?.title,
  columns:chart?.doc.options?.columns?.map((item:any)=>item.fieldname),
});

watch(()=>chart?.doc.options, ()=>{
	form.title = chart?.doc.options?.title;
	form.columns = chart?.doc.options?.columns?.fieldname;
});

const rules = reactive<FormRules>({
  columns: [
    {
      required: true,
      message: '请选择列字段',
      trigger: 'change',
    },
  ],
});
const fields = ref<locals.DocField[]>([]);

watch(doctype, async ()=>{
	if (!doctype.value){ fields.value=[]; return; }
	await new Promise(r => frappe.model.with_doctype(doctype.value!, r));
	const f = frappe.get_doc('DocType', doctype.value)?.fields || [];
	fields.value = f.filter(item=>!notValueField.includes(item.fieldtype));
}, {immediate:true});

function changeTitle(value:string){
	if (!chart){ return; }
	chart.doc.options.title =value;
}

function changeColumns(v:string){
	if (!chart){ return; }
	const columns = fields.value.map(item=>{
		if (form.columns.includes(item.fieldname)){
			return {label:item.label, fieldname:item?.fieldname, fieldtype: item.fieldtype};
		}
	}).filter(Boolean);
	chart.doc.options.columns = columns;
}

</script>

<style lang='less' scoped>
:deep(.form label) {
	margin-bottom: 0;
}
</style>
