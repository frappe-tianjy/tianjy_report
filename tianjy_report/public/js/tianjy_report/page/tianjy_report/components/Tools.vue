<template>
	<div class="tools container" v-if="editor">
		<el-tooltip content="加粗">
			<ElButton :class="{ 'is-active': editor.isActive('bold') }"
				@click="editor.chain().focus().toggleBold().run()">
				<Bold :size="16"></Bold>
			</ElButton>
		</el-tooltip>
		<el-tooltip content="斜体">
			<ElButton :class="{ 'is-active': editor.isActive('italic') }"
				@click="editor.chain().focus().toggleItalic().run()">
				<Italic :size="16"></Italic>
			</ElButton>
		</el-tooltip>
		<el-tooltip content="删除线">
			<ElButton :class="{ 'is-active': editor.isActive('strike') }"
				@click="editor.chain().focus().toggleStrike().run()">
				<Strikethrough :size="16"></Strikethrough>
			</ElButton>
		</el-tooltip>
		<el-tooltip content="左对齐">
			<ElButton @click="editor.chain().focus().setTextAlign('left').run()">
				<AlignLeft :size="16"></AlignLeft>
			</ElButton>
		</el-tooltip>
		<el-tooltip content="中间对齐">
			<ElButton @click="editor.chain().focus().setTextAlign('center').run()">
				<AlignCenter :size="16"></AlignCenter>
			</ElButton>
		</el-tooltip>
		<el-tooltip content="自动对齐">
			<ElButton @click="editor.chain().focus().setTextAlign('justify').run()">
				<AlignJustify :size="16"></AlignJustify>
			</ElButton>
		</el-tooltip>
		<el-tooltip content="右对齐">
			<ElButton @click="editor.chain().focus().setTextAlign('right').run()">
				<AlignRight :size="16"></AlignRight>
			</ElButton>
		</el-tooltip>
		<el-tooltip content="插入表格">
			<ElButton @click="editor.chain().focus()
						.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
						.run();">
				<Table :size="16"></Table>
			</ElButton>
		</el-tooltip>
		<el-tooltip content="标题1">
			<ElButton @click="editor.chain().focus()
						.setNode('heading', { level: 2 })
						.run();">
				<Heading1 :size="16"></Heading1>
			</ElButton>
		</el-tooltip>
		<el-tooltip content="标题2">
			<ElButton @click="editor.chain().focus()
						.setNode('heading', { level: 3 })
						.run();">
				<Heading2 :size="16"></Heading2>
			</ElButton>
		</el-tooltip>
		<el-tooltip content="标题3">
			<ElButton @click="editor.chain().focus()
						.setNode('heading', { level: 4 })
						.run();">
				<Heading3 :size="16"></Heading3>
			</ElButton>
		</el-tooltip>
		<el-tooltip content="图表">
			<ElButton @click="insertChart">
				<LineChart :size="16"></LineChart>
			</ElButton>
		</el-tooltip>
		<el-tooltip content="插入图片">
			<ElButton @click="insetImage">
				<Image :size="16"></Image>
			</ElButton>
		</el-tooltip>
		<el-tooltip content="有序列表">
			<ElButton @click="editor.chain().focus().toggleOrderedList().run();">
				<ListOrdered :size="16"></ListOrdered>
			</ElButton>
		</el-tooltip>
		<el-tooltip content="无序列表">
			<ElButton @click="editor.chain().focus().toggleBulletList().run();">
				<List :size="16"></List>
			</ElButton>
		</el-tooltip>
	</div>
</template>

<script setup lang='ts'>
import { ref, defineProps, defineEmits } from 'vue';

import {
	Bold, Italic, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify, Table,
	Heading1, Heading2, Heading3, LineChart, Image, ListOrdered, List,
} from 'lucide-vue-next';
interface Props{
	editor:any
}
const props = defineProps<Props>();
interface Emit{

}
const emit = defineEmits<Emit>();

function insetImage(){
	const input = document.createElement('input');
		input.setAttribute('type', 'file');
		input.setAttribute('accept', 'image/*');
		input.addEventListener('change', e => {
			if (!e.target?.files || e.target.files?.length === 0) { return; }
			const file = e.target.files[0];
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = function () {
				const url = reader.result;
				props.editor.chain().focus().setImage({ src: url })
					.run();
			};
		});
		input.click();
}
function insertChart(){
	props.editor.chain().focus()
		.insertContent(`<chart data-type="draggable-item"></chart>`)
		.run();
}
</script>

<style lang='less' scoped>
</style>
