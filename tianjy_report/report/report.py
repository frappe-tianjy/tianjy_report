import frappe
import json


@frappe.whitelist()
def load_data(name):
    return [
        {
            'chart_name': 'ae972c16b2',
            'chart_type': 'Bar',
            'data': {
                'xAxis': {
                    'type': 'category',
                    'data': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                },
                'yAxis': {
                    'type': 'value'
                },
                'series': [
                    {
                        'data': [120, 200, 150, 80, 70, 110, 130],
                        'type': 'bar',
                        'showBackground': True,
                        'backgroundStyle': {
                            'color': 'rgba(180, 180, 180, 0.2)'
                        }
                    }
                ]
            }
        }
    ]


@frappe.whitelist()
def create_block():
    block = frappe.new_doc('Tianjy Report Block')
    block.save()
    return block
