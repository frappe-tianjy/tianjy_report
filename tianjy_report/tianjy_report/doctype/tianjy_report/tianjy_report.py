# Copyright (c) 2023, Tianjy and contributors
# For license information, please see license.txt

from typing import Callable, Any
import json
import frappe
from frappe.model.document import Document

from ....source_manager import (
	register as register_source,
	get_all as get_all_sources,
	get as get_source
)

def _parse_json(value: Any) -> dict:
	try:
		if isinstance(value, str): value = json.loads(value)
		return value if isinstance(value, dict) else {}
	except:
		return {}

class TianjyReport(Document):
	@classmethod
	def find(cls, name: str):
		report: TianjyReport = frappe.get_doc('Tianjy Report', name)
		return report

	@frappe.whitelist()
	def get_data(self, **args) -> dict[str, Any]:
		"""
		获取报告数据

		Get report data
		"""

		# TODO: 权限判断

		# 获取使用到的数据源
		sources: list = self.sources

		# 按 type 分组
		source_groups = dict[str, dict[str, Any]]()
		for source in sources:
			options = _parse_json(source.options)
			type = source.type
			if type in source_groups:
				source_groups[type][source.key] = options
			else:
				source_groups[type] = {source.key:options}


		data = {}
		env = dict(report=self, args=args)
		for type, source_options in source_groups.items():
			source = get_source(type)
			if not source: continue
			if source['merge']:
				data.update(source['fn'](env, source_options))
				continue
			for key, options in source_options.items():
				data[key] = source['fn'](env, **options)

		# TODO: 数据层计算结构添加到返回数据中

		return data
