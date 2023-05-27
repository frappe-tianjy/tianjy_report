import { markRaw } from 'vue';

import {
	ChevronRightSquare,
	Heading1,
	Heading2,
	Heading3,
	LineChart,
	ParkingSquare,
	Table,
	Image,
	ListOrdered,
	List,
} from 'lucide-vue-next';
import { VueRenderer } from '@tiptap/vue-3';
import tippy from 'tippy.js';


import CommandsList from './CommandsList.vue';

export default {
	items: ({ query }) => [
		{
			title: '段落',
			icon: ParkingSquare,
			command: ({ editor, range }) => {
				editor.chain().focus().deleteRange(range)
					.setNode('paragraph')
					.run();
			},
			disabled: editor => editor.isActive('table'),
		},
		{
			title: '标题 1',
			icon: Heading1,
			command: ({ editor, range }) => {
				editor.chain().focus().deleteRange(range)
					.setNode('heading', { level: 2 })
					.run();
			},
			disabled: editor => editor.isActive('table'),
		},
		{
			title: '标题 2',
			icon: Heading2,
			command: ({ editor, range }) => {
				editor.chain().focus().deleteRange(range)
					.setNode('heading', { level: 3 })
					.run();
			},
			disabled: editor => editor.isActive('table'),
		},
		{
			title: '标题 3',
			icon: Heading3,
			command: ({ editor, range }) => {
				editor.chain().focus().deleteRange(range)
					.setNode('heading', { level: 4 })
					.run();
			},
			disabled: editor => editor.isActive('table'),
		},
		{
			title: '表格',
			icon: Table,
			command: ({ editor, range }) => {
				editor
					.chain()
					.focus()
					.deleteRange(range)
					.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
					.run();
			},
			disabled: editor => editor.isActive('table'),
		},
		{
			title: '添加列',
			command: ({ editor, range }) => {
				editor.chain().focus().deleteRange(range)
					.addColumnAfter()
					.run();
			},
			disabled: editor => !editor.isActive('table'),
		},
		{
			title: '添加行',
			command: ({ editor, range }) => {
				editor.chain().focus().deleteRange(range)
					.addRowAfter()
					.run();
			},
			disabled: editor => !editor.isActive('table'),
		},
		{
			title: '删除列',
			command: ({ editor, range }) => {
				editor.chain().focus().deleteRange(range)
					.deleteColumn()
					.run();
			},
			disabled: editor => !editor.isActive('table'),
		},
		{
			title: '删除行',
			command: ({ editor, range }) => {
				editor.chain().focus().deleteRange(range)
					.deleteRow()
					.run();
			},
			disabled: editor => !editor.isActive('table'),
		},
		{
			title: '删除表格',
			command: ({ editor, range }) => {
				editor.chain().focus().deleteRange(range)
					.deleteTable()
					.run();
			},
			disabled: editor => !editor.isActive('table'),
		},
		{
			title: '图表',
			icon: markRaw(LineChart),
			command: ({ editor, range }) => {
				const element = '<chart data-type="draggable-item"></chart>';
				editor.chain().focus().deleteRange(range)
					.insertContent(element)
					.run();
			},
			disabled: editor => !editor.isActive('paragraph') || editor.isActive('table'),
		},
		{
			title: '图片',
			icon: markRaw(Image),
			command: ({ editor, range }) => {
				const input = document.createElement('input');
				input.setAttribute('type', 'file');
				input.setAttribute('accept', 'image/*');
				input.addEventListener('change', e => {
					if (!e.target.files || e.target.files?.length === 0) { return; }
					const file = e.target.files[0];
					const reader = new FileReader();
					reader.readAsDataURL(file);
					reader.onload = function () {
						const url = reader.result;
						editor.chain().focus().setImage({ src: url })
							.run();
					};
				});
				input.click();
			},
			disabled: editor => editor.isActive('table'),
		},
		{
			title: '有序列表',
			icon: markRaw(ListOrdered),
			command: ({ editor, range }) => {
				editor.chain().focus().toggleOrderedList()
					.run();
			},
			disabled: editor => editor.isActive('table'),
		},
		{
			title: '无序列表',
			icon: markRaw(List),
			command: ({ editor, range }) => {
				editor.chain().focus().toggleBulletList()
					.run();
			},
			disabled: editor => editor.isActive('table'),
		},
	].filter(item => item.title.toLowerCase().includes(query.toLowerCase())),

	render: () => {
		let component;
		let popup;

		return {
			onStart: props => {
				component = new VueRenderer(CommandsList, {
					props,
					editor: props.editor,
				});

				if (!props.clientRect) {
					return;
				}

				popup = tippy('body', {
					getReferenceClientRect: props.clientRect,
					appendTo: () => document.body,
					content: component.element,
					showOnCreate: true,
					interactive: true,
					trigger: 'manual',
					placement: 'bottom-start',
				});
			},

			onUpdate(props) {
				component.updateProps(props);

				if (!props.clientRect) {
					return;
				}

				popup[0].setProps({
					getReferenceClientRect: props.clientRect,
				});
			},

			onKeyDown(props) {
				if (props.event.key === 'Escape') {
					popup[0].hide();

					return true;
				}

				return component.ref?.onKeyDown(props);
			},

			onExit() {
				popup[0].destroy();
				component.destroy();
			},
		};
	},
};
