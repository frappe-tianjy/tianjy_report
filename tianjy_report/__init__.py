# Copyright (c) 2023, Tianjy and Contributors
# See license.txt
"""
天玑报告 Tianjy Report
"""

__version__ = '0.0.1'

from typing import Callable, Any
import json
import frappe

_sources = dict[str, dict[str, Any]]()

def registerSource(
	name: str,
	fn: Callable,
	fields: list[dict]=[],
	merge: bool=False,
	**options
):
	"""
	使函数成为报告数据源

	Making a function a report data source

	:param name: 数据源的名字 Name of the source
	:param fn: 被注册的函数 Function to be registered
	:param fields: 数据源参数字段配置 The source parameter field configuration
	:param merge: 数据源是否合并处理 Function to be registered
	"""
	_sources[name] = dict(name=name, fields=fields, merge=merge, **options, fn=fn)

def source(
		name: str,
		fields: list[dict]=[],
		merge: bool=False,
		**options,

	):
	"""
	使函数成为报告数据源的装饰器

	Decorator for making a function a report data source

	:param name: 数据源的名字 Name of the source
	:param fields: 数据源参数字段配置 The source parameter field configuration
	:param merge: 数据源是否合并处理 Function to be registered

	用例 Use as:
	```python
	@tianjy_report.source('my_fn1', fields=[
		{'fieldname': 'doctype', reqd: 1, 'fieldtype': 'Link', 'options': 'DocType'},
	])
	def func1(doctype, **args):
		...
		return {}
	```

	用例 Use as:
	```python
	@tianjy_report.source('my_fn1', merge=True, fields=[
		{'fieldname': 'doctype', reqd: 1, 'fieldtype': 'Link', 'options': 'DocType'},
	])
	def func1(args: dict[str,dict[str, Any]]):
		data = {}
		for name, argv in args.item():
			doctype = argv.get('doctype')
			...
			data[name] = {}
		return data
	```
	"""
	def decorator(fn: Callable):
		registerSource(name, fn, fields, merge, **options)
		return fn
	return decorator



@frappe.whitelist()
def get_sources() -> list[dict[str, Any]]:
	"""
	获取所有支持的报告数据源

	Get all supported report data sources

	:url `/api/method/tianjy_report.get_sources`
	"""
	return [{k: v for k,v in value.items() if k != 'fn'} for value in _sources.values()]


def __parse_json(value: Any) -> dict:
	try:
		if isinstance(value, str): value = json.loads(value)
		return value if isinstance(value, dict) else {}
	except:
		return {}

@frappe.whitelist()
def get_data(name: str, **args) -> dict[str, Any]:
	"""
	获取报告数据

	Get report data


	:url `/api/method/tianjy_report.get_data`

	:param name: 报告的名称 Name of the report
	"""
	report = frappe.get_doc('Tianjy Report', name)

	# TODO: 权限判断

	# TODO: 获取可见块
	blocks = report.blocks

	# TODO: 应当还有一个中间层，用来数据计算

	# 获取使用到的数据源
	sources: list = report.get('sources', {
		'name': ('in', [name for block in blocks for name in block.sources.split(',') if name])
	})

	# 按 type 分组
	source_groups = dict[str, dict[str, Any]]()
	for source in sources:
		options = __parse_json(source.options)
		type = source.type
		if type in source_groups:
			source_groups[type][source.name] = __parse_json(source.options)
		else:
			source_groups[type] = {source.name: __parse_json(source.options)}


	data = {}
	for type, source_options in source_groups.items():
		source = _sources.get(type, None)
		if not source: continue
		if source['merge']:
			data.update(source['fn'](source_options))
			continue
		for name, options in source_options.items():
			data[name] = source['fn'](**options)

	# TODO: 数据层计算结构添加到返回数据中

	return data
