# Copyright (c) 2023, Tianjy and contributors
# For license information, please see license.txt
import json
import frappe
from frappe.model.document import Document

class TianjyReport(Document):
	def before_save(self):
		if self.is_new():
			report_template = frappe.get_doc("Tianjy Report Template", self.report_template)
			self.layout = report_template.layout

	def after_insert(self):
		template_blocks = frappe.get_list("Tianjy Report Template Block", 
			filters = {"report_template": self.report_template},
			fields=['*'],
			limit=0,
		)
		for block in template_blocks:
			report_block = frappe.new_doc("Tianjy Report Block")
			report_block.report = self.name
			report_block.template_block = block.name
			report_block.type = block.type
			report_block.source_doctype = block.source_doctype
			report_block.filter = block.filter
			report_block.options = block.options
			report_block.save()
