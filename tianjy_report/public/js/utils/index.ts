import { mergeAttributes, Node } from '@tiptap/core';
import { VueNodeViewRenderer } from '@tiptap/vue-3';

export function createNodeExtension(options) {
	const { name, component, tag, ...rest } = options;
	return Node.create({
		name,
		group: rest.group || 'block',
		atom: rest.atom || true,
		draggable: true,
		addAttributes() {
			return rest.attributes || {};
		},
		parseHTML() {
			return [{ tag:`${tag}[data-type="draggable-item"]` }];
		},
		renderHTML({ HTMLAttributes }) {
			return [tag, mergeAttributes(HTMLAttributes, { 'data-type': 'draggable-item' })];
		},
		addNodeView() {
			return VueNodeViewRenderer(component);
		},
	});
}
