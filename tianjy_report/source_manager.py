# Copyright (c) 2023, Tianjy and Contributors
# See license.txt
"""
天玑报告 Tianjy Report
"""

__version__ = '0.0.1'

from typing import Callable, Any

_sources = dict[str, dict[str, Any]]()

def register(type: str, fn: Callable, /, **options):
	"""
	使函数成为报告数据源

	Making a function a report data source

	:param type: 数据源类型 Type of the source
	:param fn: 被注册的函数 Function to be registered
	:param options: 数据源的选项 The Options of source
	"""
	_sources[type] = dict(**options, type=type, fn=fn)


def source(type: str, **options):
	def decorator(fn: Callable):
		register(type, fn, **options)
		return fn
	return decorator



def get_all():
	return [{k: v for k,v in value.items() if k != 'fn'} for value in _sources.values()]

def get(type: str):
	return _sources.get(type, None)
