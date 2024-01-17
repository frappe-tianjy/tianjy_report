import TianjyReport from './tianjy_report/index.vue';

import { createApp } from 'vue';
import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css';
import 'element-plus/dist/index.css'

function definePage(name, on_page_load) {
	let page = frappe.pages[name];
	if (page) {
		page.on_page_load = on_page_load;
	}
	Object.defineProperty(frappe.pages, name, {
		set(value) {
			page = value;
			if (page) {
				page.on_page_load = on_page_load;
			}
		},
		get() { return page; },
		configurable: true,
	});
}
definePage('tianjy-report-page', function (wrapper) {
	const page = frappe.ui.make_app_page({
		parent: wrapper,
		title: '报告',
		single_column: true,
	});
	const app = createApp(TianjyReport);
	app.use(VueViewer);
	app.mount(page.parent);
});
