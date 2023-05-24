<template>
	<div>
		<div ref="filerRef">
		</div>
	</div>
</template>

<script setup lang='ts'>
import { ref, defineProps, defineEmits, watch, Ref } from 'vue';

const props = defineProps<{
	options?: string;
	modelValue?: string;
}>();
const emit = defineEmits<{
	(event: 'update:modelValue', value: any): void;
	(event: 'change', value: string): void;
}>();

const filerRef = ref<Ref<HTMLDivElement>>();
const filterIns = ref();

function createFilterCom(){
	if (!props.options){ return; }
	$(filerRef.value).empty();
	filterIns.value = new frappe.ui.FilterGroup({
		parent: $(filerRef.value),
		doctype: props.options,
		on_change: () => {
			let filters = filterIns.value.get_filters();
			emit('update:modelValue', filters);
			change(filters);
		},
		base_list:undefined,
	});
}

watch([()=>props.options, ()=>props.modelValue], ()=>{
	if (!props.options){ return; }
	if (!filterIns.value||filterIns.value.doctype!==props.options){
		createFilterCom();
		return;
	}
	let filter = props.modelValue;
	if (typeof props.modelValue === 'string'){
		filter = frappe.utils.get_filter_from_json(
			props.modelValue,
			props.options
		);
	}
	frappe.model.with_doctype(props.options, () => {
		filterIns.value.clear_filters();
		filterIns.value.add_filters_to_filter_group(filter);
	});
});

function change(v:any){
	emit('change', v);
}
</script>

<style lang='less' scoped>
</style>
