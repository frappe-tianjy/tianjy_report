# Copyright (c) 2023, Tianjy and Contributors
# See license.txt
"""
天玑报告 Tianjy Report
"""

__version__ = '0.0.1'

from typing import Callable, Any
import frappe

from .tianjy_report.doctype.tianjy_report.tianjy_report import TianjyReport

from .source_manager import (
	register as register_source,
	get_all as get_all_sources,
	get as get_source
)
import tianjy_report.sources


def source(
	type: str,
	fields: list[dict]=[],
	merge: bool=False,
	**options,
):
	"""
	使函数成为报告数据源的装饰器

	Decorator for making a function a report data source

	:param type: 数据源类型 Name of the source
	:param fields: 数据源参数字段配置 The source parameter field configuration
	:param merge: 数据源是否合并处理 Function to be registered

	用例 Use as:
	```python
	@tianjy_report.source('my_fn1', fields=[
		{'fieldname': 'doctype', reqd: 1, 'fieldtype': 'Link', 'options': 'DocType'},
	])
	def func1(env, /, doctype, **args):
		...
		return {}
	```

	用例 Use as:
	```python
	@tianjy_report.source('my_fn1', merge=True, fields=[
		{'fieldname': 'doctype', reqd: 1, 'fieldtype': 'Link', 'options': 'DocType'},
	])
	def func1(env, args: dict[str,dict[str, Any]]):
		data = {}
		for name, argv in args.item():
			doctype = argv.get('doctype')
			...
			data[name] = {}
		return data
	```
	"""
	def decorator(fn: Callable):
		register_source(type, fn, fields=fields, merge=merge, **options)
		return fn
	return decorator


# @tianjy_report.source('专用数据源1', fields=[])
# def func1(**args):
# 	...
# 	return {}

# @tianjy_report.source('列表', fields=[
# 	{'fieldname': 'doctype', "reqd": 1, 'fieldtype': 'Link', 'options': 'DocType'},
# ], component="frappe.a.x.c.d")
# def func1(env, /, doctype, **args):
# 	...
# 	time = env.currentTime
# 	report = env.report
# 	arg = env.args

# 	date  = arg.get('date', 当前时间)
# 	...
# 	return {}

@frappe.whitelist()
def get_sources() -> list[dict[str, Any]]:
	"""
	获取所有支持的报告数据源类型

	Get all supported report data sources

	:url `/api/method/tianjy_report.get_sources`
	"""
	return get_all_sources()


@frappe.whitelist()
def get_data(name: str, **args) -> dict[str, Any]:
	"""
	获取报告数据

	Get report data


	:url `/api/method/tianjy_report.get_data`

	:param name: 报告的名称 Name of the report
	"""
	return TianjyReport.find(name).get_data(**args)
