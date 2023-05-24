<template>
	<div class="container">
		<editor-content :editor="editor" class="editor" />
	</div>
</template>

<script setup lang='ts'>
import { ref, defineProps, defineEmits, onMounted } from 'vue';

import { useEditor, EditorContent } from '@tiptap/vue-3';
import Table from '@tiptap/extension-table';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TableRow from '@tiptap/extension-table-row';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Gapcursor from '@tiptap/extension-gapcursor';
import Document from '@tiptap/extension-document';
import Heading from '@tiptap/extension-heading';

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

let editor = null;
onMounted(async()=>{
	const res = await frappe.call({
		method: 'tianjy_report.report.report.load_data',
		args: { name: 'edb15581d6' },
	});
	const data = res?.message||[];
	const barData = data.find(item=>item.chart_name==='ae972c16b2'&&item.chart_type==='Bar');
	const doc= {
		type:'doc',
		content:[{
			type:'chart',
			attrs:{
				chart_name:'1234',
				chart_type:barData.chart_type,
				data:barData.data,
			},
		}],
	};
	// editor.value.commands.setContent(doc, false);
});
	editor = useEditor({
		content:'',
		extensions: [
			Document,
			Heading,
			StarterKit,
			SlashCommand.configure({ suggestion }),
			Chart,
			Gapcursor,
			Table.configure({
				resizable: true,
			}),
			TableRow,
			TableHeader,
			TableCell,
			Placeholder.configure({
				placeholder: ({ node }) => {
					if (node.type.name === 'heading') {
						return `Heading ${node.attrs.level}`;
					}
					return 'Type / to insert a block';
				},
			}),
		],
	});

</script>

<style lang='less'>
.container {
	width: 50rem;
	margin: 0 auto;
}

.ProseMirror {
	>*+* {
		margin-top: 0.75em;
	}

	outline: none;
	caret-color: theme('colors.blue.600');
	word-break: break-word;
}

/* Placeholder (on every new line) */
.ProseMirror p.is-empty::before {
	content: attr(data-placeholder);
	float: left;
	color: #adb5bd;
	pointer-events: none;
	height: 0;
}

.ProseMirror h2.is-empty::before {
	content: attr(data-placeholder);
	float: left;
	color: #adb5bd;
	pointer-events: none;
	height: 0;
}

.ProseMirror h3.is-empty::before {
	content: attr(data-placeholder);
	float: left;
	color: #adb5bd;
	pointer-events: none;
	height: 0;
}

.ProseMirror h4.is-empty::before {
	content: attr(data-placeholder);
	float: left;
	color: #adb5bd;
	pointer-events: none;
	height: 0;
}

.ProseMirror {
	table {
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

.tableWrapper {
	padding: 1rem 0;
	overflow-x: auto;
}

.resize-cursor {
	cursor: ew-resize;
	cursor: col-resize;
}
</style>
