<template>
	<div>
		<el-form
			class="form"
			ref="formRef"
			label-position="top"
			:model="form"
			@submit.prevent
			:rules="rules">
			<el-form-item label="模版" prop="content">
				<ElInput type="textarea" autosize :rows="4"
					class="textarea"
					v-model="form.content"
					placeholder="请输入模版"
					resize="vertical"
					@change="changeContent"></ElInput>
			</el-form-item>
			<el-form-item label="参考字段">
				<ElTable :data="fields" height="300">
					<el-table-column prop="label" :formatter="formatter"
						label="名称" />
					<el-table-column prop="fieldname" label="标识"
						:formatter="fieldnameFormatter" />
				</ElTable>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang='ts'>
import { ref, defineProps, defineEmits, reactive, watch, inject, computed } from 'vue';

import type { FormInstance, FormRules } from 'element-plus';

import type { ChartOptions, ChartProvide } from '../../../../type';
const notValueField = ['HTML Editor', 'Text Editor', 'Code', 'Markdown Editor', 'HTML Editor', 'Column Break', 'Heading', 'Section Break', 'Tab Break', 'Connection Table'];

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
  content:chart?.doc.options?.content,
});

watch(()=>chart?.doc.options, ()=>{
	form.content = chart?.doc.options?.content;
});

const rules = reactive<FormRules>({
	content: [
    {
      required: true,
      message: '请填写模板',
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


function changeContent(v:string){
	if (!chart){ return; }
	chart.doc.options.content = v;
	const regex = /{{([^}]+)}}/g;
	const selectedFields = [];
	let match:RegExpExecArray|null;
    // eslint-disable-next-line no-cond-assign
    while (match = regex.exec(v)) {
		const fObj = fields.value.find(item=>item.fieldname === match![1] );
		if (fObj){
			selectedFields.push({label:fObj.label, fieldname:fObj.fieldname, fieldtype:fObj.fieldtype});
		}
    }
	chart.doc.options.fields=selectedFields;
}

function formatter(row:locals.DocField, column:any, cellValue:string, index:number){
	return tt(cellValue);
}
function fieldnameFormatter(row:locals.DocField, column:any, cellValue:string, index:number){
	return `{{${cellValue}}}`;
}
</script>

<style lang='less' scoped>
:deep(.form label) {
	margin-bottom: 0;
}

:deep(.textarea textarea) {
	min-height: 75px !important;
}
</style>
