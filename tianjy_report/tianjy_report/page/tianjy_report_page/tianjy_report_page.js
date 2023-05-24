frappe.pages['tianjy-report-page'].on_page_load = function (wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: '',
		single_column: true,
	});
	frappe.guigu.vuelib.utils.renderComponent(
		page.parent,
		'tianjy_report',
		'TianjyReport',
		[{
			plugin: app => { app.config.globalProperties.$page = page; },
		}]
	);
};
