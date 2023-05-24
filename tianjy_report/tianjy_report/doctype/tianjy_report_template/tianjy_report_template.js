// Copyright (c) 2023, Tianjy and contributors
// For license information, please see license.txt

frappe.ui.form.on('Tianjy Report Template', {
	refresh: function (frm) {
		if (!frm.is_new()) {
			frm.add_custom_button(__('Edit Layout'), function () {
				const a = document.createElement('a');
				a.href = `/app/tianjy-report-page?name=${frm.doc.name}&mode=template`;
				a.click();
			});
		}
	}
});
