import Suggestion from '@tiptap/suggestion';

import { Extension } from '@tiptap/core';

export default Extension.create({
	name: 'slash-commands',

	addOptions() {
		return {
			suggestion: {
				char: '/',
				command: ({ editor, range, props }) => {
					props.command({ editor, range });
				},
			},
		};
	},

	addProseMirrorPlugins() {
		return [
			Suggestion({
				editor: this.editor,
				...this.options.suggestion,
			}),
		];
	},
});
