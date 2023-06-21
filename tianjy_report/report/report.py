import frappe
import json
import requests


@frappe.whitelist()
def update_block(blockType, chartName, reportName, data):
    data = frappe.json.loads(data)
    if blockType == 'Tianjy Report Template Block':
        frappe.db.set_value(blockType, chartName, {
            'type': data['type'],
            'source_doctype': data['source_doctype'],
            'options': frappe.json.dumps(data['options'])
        })
    else:
        blocks = frappe.get_list(blockType,
                                 filters=[['report', '=', reportName], [
                                     'reference_block_name', '=', chartName]],
                                 fields=['*'],
                                 limit=0,
                                 )
        if len(blocks) > 0:
            block = frappe.get_doc(blockType, blocks[0].name)
            block.type = data['type']
            block.source_doctype = data['source_doctype']
            block.options = data['options']
            block.save()
