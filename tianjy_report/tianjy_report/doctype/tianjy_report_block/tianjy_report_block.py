# Copyright (c) 2023, Tianjy and contributors
# For license information, please see license.txt

# import frappe
from frappe.model.document import Document

class TianjyReportBlock(Document):
	def before_save(self):
		if self.is_new():
			self.reference_block_name = self.name if self.template_block is None else self.template_block