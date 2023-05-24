<template>
	<div>
		<el-form
			class="form"
			ref="formRef"
			:model="form"
			:rules="rules">
			<el-form-item label="标题" prop="title">
				<el-input v-model="form.title" />
			</el-form-item>
			<el-form-item label="单据" prop="doctype">
				<DocSelect v-model="form.doctype">
				</DocSelect>
			</el-form-item>
			<el-form-item label="图表类型" prop="chartType">
				<ElSelect v-model="form.chartType" :teleported="false">
					<ElOption value="Bar" label="柱状图"></ElOption>
					<ElOption value="Pie" label="饼状图"></ElOption>
					<ElOption value="Line" label="折线图"></ElOption>
				</ElSelect>
			</el-form-item>
			<el-form-item label="X 轴" prop="xAxis">
				<ElSelect v-model="form.xAxis" :teleported="false">
					<ElOption v-for="f in fields"
						:value="f.fieldname"
						:label="tt(f.label)">
					</ElOption>
				</ElSelect>
			</el-form-item>
			<el-form-item label="Y 轴" prop="yAxis">
				<ElSelect v-model="form.yAxis" :teleported="false">
					<ElOption v-for="f in fields"
						:value="f.fieldname"
						:label="tt(f.label)">
					</ElOption>
				</ElSelect>
			</el-form-item>
			<el-form-item>
				<el-button type="danger" @click="onDelete">删除</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang='ts'>
import { ref, defineProps, defineEmits, reactive, watch, inject } from 'vue';

import type { FormInstance, FormRules } from 'element-plus';

import DocSelect from './DocSelect.vue';
const notValueField = ['HTML Editor', 'Text Editor', 'Code', 'Markdown Editor', 'HTML Editor', 'Column Break', 'Heading', 'Section Break', 'Tab Break', 'Connection Table'];

const formRef = ref<FormInstance>();
const tt=__;
interface Props{

}
const props = defineProps<Props>();
interface Emit{

}
const emit = defineEmits<Emit>();
const chart = inject('chart');
const form = reactive({
  title: '',
  doctype: '',
  chartType:'',
  xAxis:'',
  yAxis:'',
});

const rules = reactive<FormRules>({
	doctype: [
    {
      required: true,
      message: '请选择单据',
      trigger: 'change',
    },
  ],
  chartType: [
    {
      required: true,
      message: '请选择图表类型',
      trigger: 'change',
    },
  ],
  xAxis: [
    {
      required: true,
      message: '请选择x轴字段',
      trigger: 'change',
    },
  ],
  yAxis: [
    {
      required: true,
      message: '请选择y轴字段',
      trigger: 'change',
    },
  ],

});
const fields = ref<locals.DocField[]>([]);

watch(()=>form.doctype, async ()=>{
	if (!form.doctype){ fields.value=[]; return; }
	await new Promise(r => frappe.model.with_doctype(form.doctype, r));
	const f = frappe.get_doc('DocType', form.doctype)?.fields || [];
	fields.value = f.filter(item=>!notValueField.includes(item.doctype));
}, {immediate:true});

watch(()=>form.doctype, ()=>{
	form.xAxis = '';
	form.yAxis = '';
	chart.updateQuery(form.doctype);
});
watch([()=>form.chartType, ()=>form.title, ()=>form.xAxis, ()=>form.yAxis], ()=>{
	chart.doc.type = form.chartType;
	const xAxis = fields.value.find(item=>item.fieldname === form.xAxis);
	const yAxis = fields.value.find(item=>item.fieldname === form.yAxis);
	chart.doc.options = {
		title:form.title,
		xAxis:{label:xAxis?.label, fieldname:xAxis?.fieldname},
		yAxis:{label:yAxis?.label, fieldname:yAxis?.fieldname},
	};
});
function onDelete(){

}
</script>

<style lang='less' scoped>
:deep(.form label) {
	margin-bottom: 0;
}
</style>
