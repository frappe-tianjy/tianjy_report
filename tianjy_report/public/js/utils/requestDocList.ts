function getFieldName(dt: string, field: string) {
	return frappe.model.get_full_column_name(field, dt);
}

export default async function requestDocList(
	meta: locals.DocType,
	filters: [string, string, string, any][],
	{ fields, group, limit, offset, order }: GlobalView.MainLoaderOptions,
) {
	const doctype = meta.name;
	const fieldSet = new Set<string>();
	const titleField = meta.title_field;
	const links = new Map<string, {
		field: string;
		props: Set<string>;
	}>();
	function addLink(dt: string, titleField: string, prop: string) {
		const v = links.get(dt);
		if (v) { v.props.add(prop); return; }
		links.set(dt, { field: titleField, props: new Set([prop]) });
	}
	for (const [field, dt] of fields) {
		fieldSet.add(getFieldName(dt, field));
		const meta = frappe.get_meta(dt);
		if (!meta) { continue; }
		let docField = meta.fields.find(f => f.fieldname === field);
		if (!docField) { continue; }
		if (docField.fieldtype === 'Dynamic Link') {
			const { options } = docField;
			if (!options) { continue; }
			docField = meta.fields.find(f => f.fieldname === options);
			if (!docField) { continue; }
			if (docField.fieldtype !== 'Link') { continue; }
			fieldSet.add(getFieldName(dt, docField.fieldname));
		} else if (docField.fieldtype !== 'Link' && docField.fieldtype !== 'Tree Select') { continue; }
		const { options } = docField;
		if (!options) { continue; }
		const { fieldname } = docField;
		if (fieldname === 'name') { continue; }
		const title_field = options === doctype
			? titleField
			: frappe.get_meta(options)?.title_field;
		if (!title_field) { continue; }
		if (dt === doctype) {
			addLink(options, title_field, fieldname);
			continue;
		}
		if (options === dt) { continue; }
		const fieldSql = `${fieldname}.${title_field}`;
		const name = `${fieldname}.title`;
		fieldSet.add(`${fieldSql} as \`${name}\``);
	}
	const allLinks = new Map<string, {
		field: string;
		props: Set<string>;
	}>();

	for (const [k, { field, props }] of links) {
		if (k === doctype || props.size > 1) {
			allLinks.set(k, { field, props });
			continue;
		}
		const [fieldname] = props;
		const fieldSql = `${fieldname}.${field}`;
		const name = `${fieldname}.title`;
		fieldSet.add(`${fieldSql} as \`${name}\``);
	}
	const data = await frappe.call('frappe.desk.reportview.get', {
		doctype, fields: [...fieldSet], filters,
		order_by: order
			.map(({ doctype, field, desc }) =>
				`${getFieldName(doctype, field)} ${desc ? 'DESC' : 'ASC'}`)
			.join(', ') || undefined,
		start: offset,
		page_length: limit,
		view: 'List',
		group_by: group
			.map(({ doctype, field }) => getFieldName(doctype, field))
			.join(', ') || getFieldName(doctype, 'name'),
		with_comment_count: true,
	}).then((v: any) => v.message || {});
	Object.assign(frappe.boot.user_info, data.user_info);
	const values = !Array.isArray(data)
		? frappe.utils.dict(data.keys, data.values)
		: data;
	const promises: PromiseLike<any>[] = [];
	for (const [dt, { field, props }] of allLinks) {
		const list = [...props].map(p => values.map(v => v[p])).flat().filter(Boolean);
		promises.push(frappe.call('frappe.desk.reportview.get', {
			doctype: dt,
			fields: ['name', `\`${field}\` as \`title\``],
			filters: [[dt, 'name', 'in', list]],
			page_length: 0,
			view: 'List',
			with_comment_count: false,
		}).then((v: any) => v.message || {}).then(data => {
			Object.assign(frappe.boot.user_info, data.user_info);
			const mapValue = !Array.isArray(data)
				? frappe.utils.dict(data.keys, data.values)
				: data;
			const map = new Map(mapValue.map(v => [v.name, v.title]));
			for (const p of props) {
				for (const v of values) {
					v[`${p}.title`] = map.get(v[p]);
				}
			}
		})
			.then(() => { }, () => { }));
	}
	await Promise.all(promises);
	return values;
}
