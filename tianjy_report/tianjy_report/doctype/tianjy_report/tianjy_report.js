// Copyright (c) 2023, Tianjy and contributors
// For license information, please see license.txt

frappe.ui.form.on('Tianjy Report', {
	refresh: function(frm) {
		hide_buttons(frm);
		if(!frm.is_new() && frappe.perm.has_perm("Tianjy Report", 0, 'read')){
			frm.add_custom_button('View Report', () => {
				const a = document.createElement('a');
				a.href = `/app/tianjy-report-page?name=${frm.doc.name}&mode=report`;
				a.click();
			})
		}
		if(!frm.is_new() && frappe.perm.has_perm("Tianjy Report", 0, 'write')){
			if(frm.doc.is_persistence){
				frm.add_custom_button('Data Source Cancel Persistence', () => {
					persistence(frm.doc.name, 0)
				})
			}else{
				frm.add_custom_button('Data Source Persistence', () => {
					persistence(frm.doc.name, 1)
				})
			}
		}
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

let persistence = function(name, persistence_state){
	frappe.call({
		method: "tianjy_report.tianjy_report.doctype.tianjy_report.tianjy_report.source_persistence",
		args: {
			report_name: name,
			persistence_state: persistence_state,
		},
		callback: function(r) {}
	})
}
