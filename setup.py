from setuptools import setup, find_packages

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# get version from __version__ variable in tianjy_report/__init__.py
from tianjy_report import __version__ as version

setup(
	name="tianjy_report",
	version=version,
	description="天玑报告 Tianjy Report",
	author="Tianjy",
	author_email="Tianjy",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
