<template>
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
				<ElTable :data="form.columns" style="width: 100%">
					<ElTableColumn label="字段" #="{ row, $index }">
						<ElSelect :modelValue="row.field" filterable defaultFirstOption
							@update:modelValue="setFiled($index, 'field', $event)">
							<ElOption v-for="f in fields" 
								:key="f.fieldname"
								:value="f.fieldname"
								:label="tt(f.label)" />
						</ElSelect>
					</ElTableColumn>
					<ElTableColumn label="尺寸"
							#="{ row, $index }">
							<ElInput type="number" :modelValue="row.size"
								@update:modelValue="setFiled($index, 'size', $event || 0)" />
					</ElTableColumn>
					<ElTableColumn :width="45" :label="tt('操作')" #="{ $index }">
						<ElButton type="danger" @click="remove($index)" text :icon="Delete"
							:title="tt('删除')" />
					</ElTableColumn>
				</ElTable>
			</el-form-item>
			<ElButton @click="add">{{ tt('新增') }}</ElButton>
		</el-form>
</template>

<script setup lang='ts'>
import { ref, defineProps, defineEmits, reactive, watch, inject, computed } from 'vue';

import type { FormInstance, FormRules } from 'element-plus';
import { ElForm, ElSelect, ElOption, ElFormItem, ElInput, ElTableColumn, ElTable, ElButton } from 'element-plus';
import type { ChartOptions, ChartProvide } from '../../../../type';
import { notValueField } from '../../helper';
import { Delete } from '@element-plus/icons-vue';

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
const form:{
	title:string,
	columns:{field?:string, size?:string}[]
} = reactive({
  title: chart?.doc.options?.title,
  columns:chart?.doc.options?.columns?.map((item:any)=>({field:item.fieldname, size:item.size}))||[],
});

watch(()=>chart?.doc.options, ()=>{
	form.title = chart?.doc.options?.title;
	form.columns = chart?.doc.options?.columns?.map((item:any)=>({field:item.fieldname, size:item.size}))||[]
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

function setFiled(index: number, key: any, value: any){
	if (!chart){ return; }
	const list = [...form.columns];
	const item: any = list[index];
	if (!item) { return; }
	item[key] = value;
	const allFieldNames = fields.value.map(item=>item.fieldname)
	const columns = list.filter(item=>allFieldNames.includes(item.field||''))
				.map(c=>{
					const f = fields.value.find(item=>item.fieldname===c.field)!;
					return {label:f.label, fieldname:f.fieldname, fieldtype: f.fieldtype, size:c.size}
				})
	const aa=1
	chart.doc.options.columns = columns;
}
function remove(index:number){
	if (!chart){ return; }
	const list = [...form.columns];
	if (!list.splice(index, 1).length) { return; }
	const allFieldNames = fields.value.map(item=>item.fieldname)
	const columns = list.filter(item=>allFieldNames.includes(item.field||''))
				.map(c=>{
					const f = fields.value.find(item=>item.fieldname===c.field)!;
					return {label:f.label, fieldname:f.fieldname, fieldtype: f.fieldtype, size:c.size}
				})
	form.columns = list;
	chart.doc.options.columns = columns;
}
function add() {
	form.columns = [...form.columns, {}];
}
</script>

<style lang='less' scoped>
:deep(.form label) {
	margin-bottom: 0;
}
.form{
	margin-bottom:8px
}
</style>
