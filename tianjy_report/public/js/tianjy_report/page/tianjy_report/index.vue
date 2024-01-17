<template>
	<ElConfigProvider size="small" :locale="zhCn">
		<div v-loading="loading">
			<div class="title container">
				<ElTooltip :content="subject">
					<h3 class="subject">{{ subject }}</h3>
				</ElTooltip>
				<div class="btn-container">
					<ElButton type="primary"
						v-if="mode==='report'&&isPersistence===false&&writePermission"
						class="persis-btn"
						@click="setEdit">{{edit?'查看':'编辑'}}</ElButton>
					<ElButton type="primary"
						v-if="mode==='report'&&isPersistence===false"
						class="persis-btn"
						@click="persistent">持久化</ElButton>
				</div>
			</div>
			<Tools v-if="(mode==='report'&&edit&&!isPersistence)||(mode==='template')"
				:editor="editor"></Tools>
			<div class="container editor-container ck-content">
				<editor-content :editor="editor" class="editor" />
			</div>
		</div>
	</ElConfigProvider>
</template>

<script setup lang='ts'>
import { ref, defineProps, defineEmits, onMounted, watch, computed, provide } from 'vue';

import { debounce } from 'lodash';
import { ElButton, ElTooltip } from 'element-plus';
import zhCn from 'element-plus/dist/locale/zh-cn.js';
import { ElConfigProvider } from 'element-plus';
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
import TextAlign from '@tiptap/extension-text-align';

import SlashCommand from '../command/commands';
import suggestion from '../command/suggestion';

import Chart from './components/Chart';
import Tools from './components/Tools.vue';
interface Props{

}
const props = defineProps<Props>();
interface Emit{

}
const emit = defineEmits<Emit>();
const searchParams = new URLSearchParams(location.search);
const reportName = searchParams.get('name');
const mode = searchParams.get('mode') as 'template'|'report';
const content = ref<Record<string, any>>({});
const subject = ref<string>('');
const loaded = ref<boolean>(false);
const loading = ref<boolean>(true);

const isPersistence=ref<boolean>(false);
const reportStartDate=ref<string>('');
const reportEndDate=ref<string>('');
const edit = ref<boolean>(false);
const writePermission = ref<boolean>(false);
provide('isPersistence', isPersistence);
provide('reportStartDate', reportStartDate);
provide('reportEndDate', reportEndDate);
const reportType =computed(()=>mode==='template'?'Tianjy Report Template':'Tianjy Report');

function saveLayout(json:any){
	if (!reportName){ return; }
	frappe.db.set_value(reportType.value, reportName, {layout:json});
}
const updateLayout = debounce(saveLayout, 500);

frappe.model.with_doctype('Tianjy Report', () => {
	writePermission.value = frappe.perm.has_perm('Tianjy Report', 0, 'write');
});
const editor = useEditor({
		onUpdate: ({ editor }:{editor:any}) => {
			const json = editor.getJSON();
			if (!loaded.value){ return; }
			updateLayout(json);
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
				placeholder: ({ node }:{node:any}) => {
					if (node.type.name === 'heading') {
						return `Heading ${node.attrs.level-1}`;
					}
					return 'Type / to insert a block';
				},
			}),
			Image.configure({
				inline: true,
				allowBase64: true,
			}),
			BulletList,
			OrderedList,
			ListItem,
			TextAlign.configure({
				types: ['heading', 'paragraph'],
			}),
		],
	});
watch([()=>reportName, ()=>mode], async()=>{
	if (!reportName){ return; }
	loaded.value=false;
	loading.value=true;
	const res:{layout?:string, subject:string, is_persistence?:0|1, start_date:string, end_date:string} = await frappe.db.get_doc(reportType.value, reportName );
	content.value = JSON.parse(res.layout||'{}');
	subject.value = res.subject;
	reportStartDate.value = res.start_date;
	reportEndDate.value = res.end_date
	const editable = mode==='template';
	editor.value?.setEditable(editable);
	isPersistence.value = res.is_persistence?.toString()==='1';
	loaded.value=true;
	loading.value=false;
}, {immediate:true});

watch([content, editor], ()=>{
	if (!editor.value){ return; }
	if (!loaded.value){ return; }
	editor.value.commands.setContent(content.value||'', false);
}, {immediate:true});

async function persistent(){
	loading.value=true;
	await frappe.call({
		method: 'tianjy_report.tianjy_report.doctype.tianjy_report.tianjy_report.source_persistence',
		args: {
			report_name: reportName,
			persistence_state: 1,
		},
	});
	const a = document.createElement('a');
	a.href = `/app/tianjy-report-page?name=${reportName}&mode=report`;
	a.click();
	loading.value=false;
}
function setEdit(){
	edit.value = !edit.value;
	editor.value.setEditable(edit.value);
}
</script>

<style lang='less' scoped>
.title {
	height: 75px;
	height: 75px;
	display: flex;
	align-items: center;
	line-height: 75px;
	justify-content: space-between;

	h3 {
		margin: 0;
		word-break: break-all;
		text-overflow: ellipsis;
		overflow: hidden;
		white-space: nowrap;
	}

	.btn-container {
		display: flex;
	}
}

.container {
	max-width: 50rem;
	margin: 0 auto;
	background: #fff;
}

.editor-container {
	height: calc(100vh - 170px);
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
