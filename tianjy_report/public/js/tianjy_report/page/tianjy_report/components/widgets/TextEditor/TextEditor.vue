<template>
	<div ref="textEditorContent" class="text-container"></div>
</template>

<script setup lang="ts">
import { inject, ref, onMounted, reactive, watch, onUnmounted } from 'vue';

import { ChartProvide } from '../../../../type';

interface Props{
	data:Record<string, any>[]
	options:Record<string, any>
	isEditable:boolean
}
const props = defineProps<Props>();
const textEditorContent = ref<HTMLDivElement|null>(null);
const chart = inject<ChartProvide>('chart');

let editor;
onMounted(()=>{
	ClassicEditor.create(textEditorContent.value, {
		toolbar: {
			items: [
				'fullscreen',
				'heading',
				'|',
				'bold',
				'italic',
				'underline',
				'link',
				'bulletedList',
				'numberedList',
				'|',
				'outdent',
				'alignment',
				'indent',
				'|',
				'fontBackgroundColor',
				'fontColor',
				'fontSize',
				'fontFamily',
				'|',
				'imageInsert',
				'insertTable',
				'|',
				'blockQuote',
				'mediaEmbed',
				'undo',
				'redo',
				'todoList',
				'code',
				'codeBlock',
				'findAndReplace',
				'specialCharacters',
			],
		},
	}).then(newEditor => {
        editor = newEditor;
		editor.model.document.on('change:data', (a, b, c) => {
			if (!chart){ return; }
			chart.doc.options.data=editor.getData();
    	});
		editor.setData(props.options?.data||'');
		const toolbarElement = newEditor.ui.view.toolbar.element;
		editor.on( 'change:isReadOnly', ( evt, propertyName, isReadOnly ) => {
            if ( isReadOnly ) {
                toolbarElement.style.display = 'none';
            } else {
                toolbarElement.style.display = 'flex';
            }
        } );
		if (props.isEditable){
			editor.disableReadOnlyMode( 'readonly' );
		} else {
			editor.enableReadOnlyMode( 'readonly' );
		}

    } );
});

watch([props.options, ()=>editor], ()=>{
	if (!editor){
		return;
	}
	if (props.options?.data===editor.getData()){
		return;
	}
	editor.setData(props.options?.data||'');
}, {immediate:true});
watch([()=>props.isEditable, ()=>editor], ()=>{
	if (!editor){
		return;
	}
	if (props.isEditable){
		editor.disableReadOnlyMode( 'readonly' );
	} else {
		editor.enableReadOnlyMode( 'readonly' );
	}
}, {immediate:true});
onUnmounted(()=>{
	editor?.destroy();
});
</script>
<style scoped>
.text-container {
	word-break: break-all;
	white-space: break-spaces;
}

.placeholder {
	height: 200px;
	width: 100%;
	text-align: center;
}
</style>
