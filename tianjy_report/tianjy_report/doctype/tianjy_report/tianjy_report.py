# Copyright (c) 2023, Tianjy and contributors
# For license information, please see license.txt
from datetime import datetime, date
import json
import frappe
from frappe.model.base_document import get_controller
from frappe.model.document import Document
from frappe.desk.reportview import get_form_params, compress, execute
from frappe.model.utils import is_virtual_doctype
from frappe.utils.response import json_handler

class TianjyReport(Document):
	def before_save(self):
		if self.is_new():
			report_template = frappe.get_doc("Tianjy Report Template", self.report_template)
			self.layout = report_template.layout

	def after_insert(self):
		"""
		报告创建后根据报告模版的块创建报告块
		"""
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

def get_data(args):
	if is_virtual_doctype(args.doctype):
		controller = get_controller(args.doctype)
		data = compress(controller.get_list(args))
	else:
		data = compress(execute(**args), args=args)
	return data
		

@frappe.whitelist()
def source_persistence(report_name):
	"""
	持久化报告的数据源
	"""
	report = frappe.get_doc("Tianjy Report", report_name)
	report.set("is_persistence", 1)
	report.save()
	blocks = frappe.get_list("Tianjy Report Block",
		filters = {"report": report_name},
		fields = ['*'],
		limit = 0
	)
	for block in blocks:
		query_params = {
			"doctype": block.source_doctype,
			"fields": ["*"],
			"filters": eval(block.filter),
			'strict': "None"
		}
		data = get_data(frappe._dict(query_params))
		sources = json.dumps(data, default=json_handler)
		_block = frappe.get_doc("Tianjy Report Block", block.name)
		_block.set('sources', sources)
		_block.save()

