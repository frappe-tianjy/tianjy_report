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
} from 'lucide-vue-next';
import { VueRenderer } from '@tiptap/vue-3';
import tippy from 'tippy.js';


import CommandsList from './CommandsList.vue';

export default {
	items: ({ query }) => [
		{
			title: 'Paragraph',
			icon: ParkingSquare,
			command: ({ editor, range }) => {
				editor.chain().focus().deleteRange(range)
					.setNode('paragraph')
					.run();
			},
			disabled: editor => editor.isActive('table'),
		},
		{
			title: 'Heading 1',
			icon: Heading1,
			command: ({ editor, range }) => {
				editor.chain().focus().deleteRange(range)
					.setNode('heading', { level: 2 })
					.run();
			},
			disabled: editor => editor.isActive('table'),
		},
		{
			title: 'Heading 2',
			icon: Heading2,
			command: ({ editor, range }) => {
				editor.chain().focus().deleteRange(range)
					.setNode('heading', { level: 3 })
					.run();
			},
			disabled: editor => editor.isActive('table'),
		},
		{
			title: 'Heading 3',
			icon: Heading3,
			command: ({ editor, range }) => {
				editor.chain().focus().deleteRange(range)
					.setNode('heading', { level: 4 })
					.run();
			},
			disabled: editor => editor.isActive('table'),
		},
		{
			title: 'Table',
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
			title: 'Add Column',
			command: ({ editor, range }) => {
				editor.chain().focus().deleteRange(range)
					.addColumnAfter()
					.run();
			},
			disabled: editor => !editor.isActive('table'),
		},
		{
			title: 'Add Row',
			command: ({ editor, range }) => {
				editor.chain().focus().deleteRange(range)
					.addRowAfter()
					.run();
			},
			disabled: editor => !editor.isActive('table'),
		},
		{
			title: 'Delete Column',
			command: ({ editor, range }) => {
				editor.chain().focus().deleteRange(range)
					.deleteColumn()
					.run();
			},
			disabled: editor => !editor.isActive('table'),
		},
		{
			title: 'Delete Row',
			command: ({ editor, range }) => {
				editor.chain().focus().deleteRange(range)
					.deleteRow()
					.run();
			},
			disabled: editor => !editor.isActive('table'),
		},
		{
			title: 'Delete Table',
			command: ({ editor, range }) => {
				editor.chain().focus().deleteRange(range)
					.deleteTable()
					.run();
			},
			disabled: editor => !editor.isActive('table'),
		},
		{
			title: 'Chart',
			icon: markRaw(LineChart),
			command: ({ editor, range }) => {
				const element = '<chart></chart>';
				editor.chain().focus().deleteRange(range)
					.insertContent(element)
					.run();
			},
			disabled: editor => !editor.isActive('paragraph') || editor.isActive('table'),
		},
		{
			title: 'Image',
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
			disabled: editor => !editor.isActive('paragraph') || editor.isActive('table'),
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
