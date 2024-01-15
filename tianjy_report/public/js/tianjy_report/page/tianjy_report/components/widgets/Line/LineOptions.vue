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
			<el-form-item label="X 轴" prop="xAxis">
				<ElSelect v-model="form.xAxis"
					@change="changeX">
					<ElOption v-for="f in fields"
						:value="f.fieldname"
						:label="tt(f.label)">
					</ElOption>
				</ElSelect>
			</el-form-item>
			<el-form-item label="Y 轴" prop="yAxis">
				<ElSelect v-model="form.yAxis" multiple
					@change="changeY">
					<ElOption v-for="f in numberFields"
						:value="f.fieldname"
						:label="tt(f.label)">
					</ElOption>
				</ElSelect>
			</el-form-item>
			<el-form-item label="x轴名称" prop="xLabel">
				<el-input v-model="form.xLabel" @change="changeXLabel" />
			</el-form-item>
			<el-form-item label="y轴名称" prop="yLabel">
				<el-input v-model="form.yLabel" @change="changeYLabel" />
			</el-form-item>
		</el-form>
	</div>
</template>

<script setup lang='ts'>
import { ref, defineProps, defineEmits, reactive, watch, inject, computed } from 'vue';

import type { FormInstance, FormRules } from 'element-plus';

import type { ChartOptions, ChartProvide } from '../../../../type';
import { numberFieldTypes, notValueField } from '../../helper';

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
  xAxis:chart?.doc.options?.xAxis?.fieldname,
  yAxis:chart?.doc.options?.yAxis?.map(item=>item.fieldname),
  xLabel: chart?.doc.options?.xLabel,
  yLabel: chart?.doc.options?.yLabel,

});

watch(()=>chart?.doc.options, ()=>{
	form.title = chart?.doc.options?.title;
	form.xAxis = chart?.doc.options?.xAxis?.fieldname;
	form.yAxis = chart?.doc.options?.yAxis?.map(item=>item.fieldname);
	form.xLabel = chart?.doc.options?.xLabel;
	form.yLabel = chart?.doc.options?.yLabel;
});

const rules = reactive<FormRules>({
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

watch(doctype, async ()=>{
	if (!doctype.value){ fields.value=[]; return; }
	await new Promise(r => frappe.model.with_doctype(doctype.value!, r));
	const f = frappe.get_doc('DocType', doctype.value)?.fields || [];
	fields.value = f.filter(item=>!notValueField.includes(item.fieldtype));
}, {immediate:true});
const numberFields = computed(()=>fields.value.filter(f=>numberFieldTypes.includes(f.fieldtype)));

function changeTitle(value:string){
	if (!chart){ return; }
	chart.doc.options.title =value;
}
function changeXLabel(value:string){
	if (!chart){ return; }
	chart.doc.options.xLabel =value;
}
function changeYLabel(value:string){
	if (!chart){ return; }
	chart.doc.options.yLabel =value;
}
function changeX(v:string){
	if (!chart){ return; }
	const xAxis = fields.value.find(item=>item.fieldname === form.xAxis);
	chart.doc.options.xAxis = {label:xAxis?.label, fieldname:xAxis?.fieldname, fieldtype:xAxis?.fieldtype};
}
function changeY(v:string[]){
	if (!chart){ return; }
	const yAxisArr = fields.value.filter(item=>v.includes(item.fieldname));
	chart.doc.options.yAxis = yAxisArr.map(item=>({label:item?.label, fieldname:item?.fieldname, fieldtype:item?.fieldtype}));
}

</script>

<style lang='less' scoped>
:deep(.form label) {
	margin-bottom: 0;
}
</style>
