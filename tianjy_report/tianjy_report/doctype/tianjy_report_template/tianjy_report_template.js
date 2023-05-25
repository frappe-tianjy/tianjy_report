// Copyright (c) 2023, Tianjy and contributors
// For license information, please see license.txt

frappe.ui.form.on('Tianjy Report Template', {
	refresh: function(frm) {
		bulk_report_table_button(frm)
		if(!frm.is_new() && frappe.perm.has_perm("Tianjy Report Template", 0, 'write')){
			frm.add_custom_button('Edit Report Template Layout', () => {
				const a = document.createElement('a');
				a.href = `/app/tianjy-report-page?name=${frm.doc.name}&mode=template`;
				a.click();
			})
		}
	}
});

let bulk_report_table_button = function (frm) {
	const report_table = frm.fields_dict['reports'];
	report_table.setActionButtonVisible('unlink', false);
	report_table.setActionButtonVisible('delete', false);
	report_table.setButtonVisible('link', false);
	report_table.setButtonVisible('delete', false);
	report_table.addCustomActionButton('before', 1,
		{ title: __('View Report'), type: 'primary' },
		function (frm) {
			frappe.set_route("报表查看页面");
		}
	);
}
