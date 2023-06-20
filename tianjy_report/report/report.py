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


@frappe.whitelist()
def get_guest_token(chart):
    setting = frappe.get_doc('Guigu Superset Setting')
    if setting is None:
        return
    base_url = setting.superset_domain
    session = requests.session()
    account_data = json.dumps({
        "password": setting.administrator_password, "provider": "db", "refresh": True, "username": setting.administrator
    })
    res = session.post("%s/api/v1/security/login" % base_url,
                       data=account_data, headers={
                           "Content-Type": "application/json"
                       })
    token = json.loads(res.text)["access_token"]

    token_res = session.get(
        '%s/api/v1/security/csrf_token' % base_url, headers={"Authorization": "Bearer %s" % (token)})
    csrf_token = json.loads(token_res.text)['result']
    chart_data = json.dumps({
        "user": {"username": setting.guest_username, "first_name": setting.guest_first_name, "last_name": setting.guest_last_name},
        "resources": [{"type": "dashboard", "id": chart}],
        "rls": []
    })
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer %s" % (token),
        "X-CSRFToken": csrf_token,
    }
    guest_res = session.post('%s/api/v1/security/guest_token/' % base_url,
                             data=chart_data, headers=headers)
    chart_token = json.loads(guest_res.text)['token']
    return chart_token
