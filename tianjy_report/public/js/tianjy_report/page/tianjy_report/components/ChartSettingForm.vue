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
			<el-form-item label="单据" prop="doctype">
				<DocSelect v-model="form.doctype" @change="changeDoctype">
				</DocSelect>
			</el-form-item>
			<el-form-item label="图表类型" prop="chartType">
				<ElSelect v-model="form.chartType" :teleported="false"
					@change="changeType">
					<ElOption value="Bar" label="柱状图"></ElOption>
					<ElOption value="Pie" label="饼状图"></ElOption>
					<ElOption value="Line" label="折线图"></ElOption>
				</ElSelect>
			</el-form-item>
			<el-form-item label="X 轴" prop="xAxis">
				<ElSelect v-model="form.xAxis" :teleported="false"
					@change="changeX">
					<ElOption v-for="f in fields"
						:value="f.fieldname"
						:label="tt(f.label)">
					</ElOption>
				</ElSelect>
			</el-form-item>
			<el-form-item label="Y 轴" prop="yAxis">
				<ElSelect v-model="form.yAxis" :teleported="false"
					@change="changeY">
					<ElOption v-for="f in fields"
						:value="f.fieldname"
						:label="tt(f.label)">
					</ElOption>
				</ElSelect>
			</el-form-item>
			<el-form-item label="过滤器" prop="filter">
				<Filter v-model="form.filter" :options="form.doctype"
					@change="changeFilter"></Filter>
			</el-form-item>
			<el-form-item>
				<el-button type="danger" @click="onDelete">删除</el-button>
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang='ts'>
import { ref, defineProps, defineEmits, reactive, watch, inject, Ref } from 'vue';

import type { FormInstance, FormRules } from 'element-plus';

import { ChartOptions, ChartProvide } from '../../type';

import DocSelect from './DocSelect.vue';
import Filter from './Filter.vue';
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
const form = reactive({
  title: chart?.doc.options?.title,
  doctype: chart?.doc.source_doctype||'',
  chartType:chart?.doc.type||'',
  xAxis:chart?.doc.options?.xAxis?.fieldname,
  yAxis:chart?.doc.options?.yAxis?.fieldname,
  filter:chart?.doc.filter,
});

watch(()=>chart?.doc.options, ()=>{
	form.title = chart?.doc.options?.title;
	form.xAxis = chart?.doc.options?.xAxis?.fieldname;
	form.yAxis = chart?.doc.options?.yAxis?.fieldname;
});
watch(()=>chart?.doc.type, ()=>{
	form.chartType = chart?.doc.type||'';
});
watch(()=>chart?.doc.source_doctype, ()=>{
	form.doctype = chart?.doc.source_doctype||'';
});
watch(()=>chart?.doc.filter, ()=>{
	form.filter = chart?.doc.filter;
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
	fields.value = f.filter(item=>!notValueField.includes(item.fieldtype));
}, {immediate:true});

function changeTitle(value:string){
	if (!chart){ return; }
	chart.doc.options.title =value;
}
function changeDoctype(v:string){
	if (!chart){ return; }
	form.xAxis = '';
	form.yAxis = '';
	chart?.updateQuery(v);
}
function changeType(v:string){
	if (!chart){ return; }
	chart.doc.type = v;
}
function changeX(v:string){
	if (!chart){ return; }
	const xAxis = fields.value.find(item=>item.fieldname === form.xAxis);
	chart.doc.options.xAxis = {label:xAxis?.label, fieldname:xAxis?.fieldname};
}
function changeY(v:string){
	if (!chart){ return; }
	const yAxis = fields.value.find(item=>item.fieldname === form.yAxis);
	chart.doc.options.yAxis = {label:yAxis?.label, fieldname:yAxis?.fieldname};
}
function changeFilter(v:any){
	chart?.updateQuery(form.doctype, v);
}
function onDelete(){
	chart?.delete();
	emit('remove');
}
</script>

<style lang='less' scoped>
:deep(.form label) {
	margin-bottom: 0;
}
</style>
