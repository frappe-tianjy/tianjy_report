// Copyright (c) 2023, Tianjy and contributors
// For license information, please see license.txt

frappe.ui.form.on('Tianjy Report', {
	refresh: function(frm) {
		hide_buttons(frm);
		if(!frm.is_new() && frappe.perm.has_perm("Tianjy Report", 0, 'read')){
			frm.add_custom_button('View Report', () => {
				frappe.set_route("报告查看");
			})
		}
		frm.add_custom_button('持久化', () => {
			per(frm.doc.name)
		})
	},
});

let hide_buttons = function (frm) {
	const blocks = frm.fields_dict['blocks'];
	blocks.setActionButtonVisible('unlink', false);
	blocks.setActionButtonVisible('delete', false);
	blocks.setButtonVisible('link', false);
	blocks.setButtonVisible('delete', false);
	blocks.setButtonVisible('add', false);
}

let per = function(name){
	frappe.call({
		method: "tianjy_report.tianjy_report.doctype.tianjy_report.tianjy_report.source_persistence",
		args: {
			report_name: name,
		},
		callback: function(r) {}
	})
}
