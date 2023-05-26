<template>
	<div class="title container">
		<h3>{{ subject }}</h3>
	</div>
	<div class="container editor-container">
		<editor-content :editor="editor" class="editor" />
		<bubble-menu
			:editor="editor"
			:tippy-options="{ duration: 100 }"
			v-if="editor">
			<ElButton type="default"
				@click="editor.chain().focus().toggleBold().run()"
				:class="{ 'is-active': editor.isActive('bold') }">
				bold
			</ElButton>
			<ElButton @click="editor.chain().focus().toggleItalic().run()"
				:class="{ 'is-active': editor.isActive('italic') }">
				italic
			</ElButton>
			<ElButton @click="editor.chain().focus().toggleStrike().run()"
				:class="{ 'is-active': editor.isActive('strike') }">
				strike
			</ElButton>
		</bubble-menu>
	</div>
</template>

<script setup lang='ts'>
import { ref, defineProps, defineEmits, onMounted, watch, computed } from 'vue';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/vue-3';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Gapcursor from '@tiptap/extension-gapcursor';
import Document from '@tiptap/extension-document';
import Heading from '@tiptap/extension-heading';
import Image from '@tiptap/extension-image';
import BulletList from '@tiptap/extension-bullet-list';
import ListItem from '@tiptap/extension-list-item';
import OrderedList from '@tiptap/extension-ordered-list';

import SlashCommand from '../command/commands';
import suggestion from '../command/suggestion';

import Chart from './components/Chart';

interface Props{

}
const props = defineProps<Props>();
interface Emit{

}
const emit = defineEmits<Emit>();
const searchParams = new URLSearchParams(location.search);
const reportName = searchParams.get('name');
const mode = searchParams.get('mode');
const content = ref<Record<string, any>>({});
const subject = ref<string>('');

const reportType =computed(()=>mode==='template'?'Tianjy Report Template':'Tianjy Report');

function saveLayout(json:any){
	if (!reportName){ return; }
	if (mode!=='template'){ return; }
	frappe.db.set_value(reportType.value, reportName, {layout:json});
}
const editor = useEditor({
		content:'',
		onUpdate: ({ editor }) => {
			const json = editor.getJSON();
			saveLayout(json);
		},
		editable:false,
		extensions: [
			Document,
			Heading,
			StarterKit,
			SlashCommand.configure({ suggestion }),
			Chart,
			Gapcursor,
			Table.configure({
				resizable: true,
				HTMLAttributes: {
					class: 'tableWrapper',
				},
			}),
			TableRow,
			TableHeader,
			TableCell,
			Placeholder.configure({
				placeholder: ({ node }) => {
					if (node.type.name === 'heading') {
						return `Heading ${node.attrs.level-1}`;
					}
					return 'Type / to insert a block';
				},
			}),
			BubbleMenu,
			Image.configure({
				inline: true,
				allowBase64: true,
			}),
			BulletList,
			OrderedList,
			ListItem,
		],
	});
watch([()=>mode, editor], ()=>{
	if (!editor.value){ return; }
	editor.value.setEditable(mode==='template');
}, {immediate:true});
watch([()=>reportName, ()=>mode], async()=>{
	if (!reportName){ return; }
	const res:{layout?:string, subject:string} = await frappe.db.get_doc(reportType.value, reportName );
	content.value = JSON.parse(res.layout||'{}');
	subject.value = res.subject;
}, {immediate:true});

watch([content, editor], ()=>{
	if (!editor.value){ return; }
	editor.value.commands.setContent(content.value||'', false);
}, {immediate:true});
</script>

<style lang='less' scoped>
.title {
	height: 75px;
	height: 75px;
	display: flex;
	align-items: center;
	line-height: 75px;

	h3 {
		margin: 0;
	}
}

.container {
	width: 50rem;
	margin: 0 auto;
	background: #fff;
}

.editor-container {
	height: calc(100vh - 135px);
	overflow: auto;
}

:deep(.ProseMirror) {
	>*+* {
		margin-top: 0.75em;
	}

	outline: none;
	caret-color: theme('colors.blue.600');
	word-break: break-word;
}

/* Placeholder (on every new line) */
:deep(.ProseMirror p.is-empty::before) {
	content: attr(data-placeholder);
	float: left;
	color: #adb5bd;
	pointer-events: none;
	height: 0;
}

:deep(.ProseMirror h2.is-empty::before) {
	content: attr(data-placeholder);
	float: left;
	color: #adb5bd;
	pointer-events: none;
	height: 0;
}

:deep(.ProseMirror h3.is-empty::before) {
	content: attr(data-placeholder);
	float: left;
	color: #adb5bd;
	pointer-events: none;
	height: 0;
}

:deep(.ProseMirror h4.is-empty::before) {
	content: attr(data-placeholder);
	float: left;
	color: #adb5bd;
	pointer-events: none;
	height: 0;
}

:deep(.ProseMirror) {
	table.tableWrapper {
		border-collapse: collapse;
		table-layout: fixed;
		width: 100%;
		margin: 0;
		overflow: hidden;

		td,
		th {
			min-width: 1em;
			border: 2px solid #ced4da;
			padding: 3px 5px;
			vertical-align: top;
			box-sizing: border-box;
			position: relative;

			>* {
				margin-bottom: 0;
			}
		}

		th {
			font-weight: bold;
			text-align: left;
			background-color: #f1f3f5;
		}

		.selectedCell:after {
			z-index: 2;
			position: absolute;
			content: "";
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			background: rgba(200, 200, 255, 0.4);
			pointer-events: none;
		}

		.column-resize-handle {
			position: absolute;
			right: -2px;
			top: 0;
			bottom: -2px;
			width: 4px;
			background-color: #adf;
			pointer-events: none;
		}

		p {
			margin: 0;
		}
	}
}

:deep(.ProseMirror) {
	.tableWrapper table {
		border-collapse: collapse;
		table-layout: fixed;
		width: 100%;
		margin: 0;
		overflow: hidden;

		td,
		th {
			min-width: 1em;
			border: 2px solid #ced4da;
			padding: 3px 5px;
			vertical-align: top;
			box-sizing: border-box;
			position: relative;

			>* {
				margin-bottom: 0;
			}
		}

		th {
			font-weight: bold;
			text-align: left;
			background-color: #f1f3f5;
		}

		.selectedCell:after {
			z-index: 2;
			position: absolute;
			content: "";
			left: 0;
			right: 0;
			top: 0;
			bottom: 0;
			background: rgba(200, 200, 255, 0.4);
			pointer-events: none;
		}

		.column-resize-handle {
			position: absolute;
			right: -2px;
			top: 0;
			bottom: -2px;
			width: 4px;
			background-color: #adf;
			pointer-events: none;
		}

		p {
			margin: 0;
		}
	}
}

:deep(.tableWrapper) {
	padding: 1rem 0;
	overflow-x: auto;
}

:deep(.resize-cursor) {
	cursor: ew-resize;
	cursor: col-resize;
}
</style>
