import TianjyReport from './tianjy_report/index.vue';

import { createApp, h, ref, } from 'vue';
import Viewer from 'v-viewer'
import 'viewerjs/dist/viewer.css';

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

const reportNameRef = ref()
frappe.ui.form.on('Tianjy Report', {
	refresh(frm){
		if(!frm.is_new()){
			reportNameRef.value = frm.doc.name
			if(!frm.report_app){
				const app = createApp({props: [], render: () =>h(TianjyReport, {
					reportName: reportNameRef.value,
					mode:'report',
				})});
				app.use(VueViewer)
				app.mount(frm.fields_dict.report_wrapper.wrapper)
				frm.report_app = app;
			}
		}
	}
})
