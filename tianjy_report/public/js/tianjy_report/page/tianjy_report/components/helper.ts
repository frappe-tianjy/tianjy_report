import { reactive } from 'vue';

import { watchDebounced, watchOnce } from '@vueuse/core';
import { debounce } from 'lodash';

import { ChartOptions, ChartProvide } from '../../type';
import requestDocList from '../../../../utils/requestDocList';
export const numberFieldTypes=['Currency', 'Float', 'Int', 'Percent'];

function safeJSONParse(str:string, defaultValue = null) {
	if (str === null || str === undefined) {
		return defaultValue;
	}

	if (typeof str !== 'string') {
		return str;
	}

	try {
		return JSON.parse(str);
	} catch (e) {
		return defaultValue;
	}
}
export async function loadLinkDocTypes(meta: locals.DocType) {
	const linkDocTypes = meta.fields
		.map(df => df.fieldtype === 'Link'||df.fieldtype==='Tree Select' ? df.options as string : '')
		.filter(Boolean);

	await Promise.all(
		[...new Set(linkDocTypes)].map(doctype => new Promise<void>(resolve => {
			frappe.model.with_doctype(doctype, () => { resolve(); });
		}))
	);

}

const charts:Record<string, any> = {};

export async function createChart(reportName:string, mode:string|null) {
	const data = mode==='template'?{
		doctype: 'Tianjy Report Template Block',
		report_template: reportName,
	}:{
		doctype:'Tianjy Report Block',
		report:reportName,
	};

	const res = await frappe.db.insert(data);
	return res?.name||'';
}

export default function useChart(initChart:ChartOptions, reportName:string, name:string, mode:string|null, isPersistence:boolean|null) {
	if (!charts[name]) {
		charts[name] = getChart(initChart, reportName, name, mode, isPersistence);
	}
	return charts[name];
}

function getChart(initChart:ChartOptions, reportName:string, chartName:string, mode:string|null, isPersistence:boolean|null):ChartProvide {
	const blockType = mode==='template'?'Tianjy Report Template Block':'Tianjy Report Block';
	const state = initChart;
	async function load() {
		state.loading = true;
		try {
			let block:any={};
			if (mode==='template'){
				block = await frappe.db.get_doc(blockType, chartName);
			} else {
				const blocks = await frappe.db.get_list(blockType, {
					fields:['*'],
					filters:[['report', '=', reportName], ['reference_block_name', '=', chartName]],
				});
				[block] = blocks;
			}
			if (block.options){
				block.options = safeJSONParse(block.options);
			} else {
				block.options = {};
			}
			state.doc = block;
			if (block.sources){
				state.doc.sources = safeJSONParse(block.sources);
			}
			let {filter} = block;
			if (typeof block.filter === 'string'){
				filter = frappe.utils.get_filter_from_json(
					block.filter,
					state.doc.source_doctype
				);
			}
			state.doc.filter = filter;
			if (!state.doc.source_doctype) {
				state.loading = false;
				return;
			}
			updateChartData();
		} catch {
			state.loading = false;
		}
	}
	load();

	async function updateChartData() {
		state.loading = true;
		if (!state.doc.source_doctype){ return; }
		if (isPersistence===true){
			state.data = state.doc.sources;
			state.loading = false;
		} else {
			frappe.model.with_doctype(state.doc.source_doctype, async () => {
				if (!state.doc.source_doctype){ return; }
				const meta = frappe.get_meta(state.doc.source_doctype);
				if (!meta){ return; }
				const notValueField = ['HTML Editor', 'Text Editor', 'Code', 'Markdown Editor', 'HTML Editor',
				'Column Break', 'Heading', 'Section Break', 'Tab Break', 'Button', 'Fold', 'Connection Table', 'Table', 'Table MultiSelect' ];
				await loadLinkDocTypes(meta);
				const fields:[string, string][] = meta.fields
					.filter(f=>!notValueField.includes(f.fieldtype)).map(f=>[f.fieldname, meta.name]);
				const list = await requestDocList(meta, state.doc.filter??undefined, {
					fields, limit:0, order:[], group:[],
				});
				state.data = list;
				state.loading = false;
			});
		}

	}

	function save() {
		frappe.db.set_value(blockType, chartName, {
			type: state.doc.type,
			source_doctype: state.doc.source_doctype,
			options: state.doc.options,
		});
	}


	async function asyncUpdateQuery(doctype:string, filter?:any) {
		if (!doctype) { return; }
		if (state.doc.source_doctype === doctype&&filter===state.doc.filter) { return; }
		state.doc.source_doctype = doctype;
		state.doc.filter = filter||[];
		const filterJson = frappe.utils.get_filter_as_json(filter||[]);
		await frappe.db.set_value(blockType, chartName, {
			source_doctype:doctype,
			filter:filterJson,
		});
		updateChartData();
	}
	const updateQuery = debounce(asyncUpdateQuery, 500);

	let autosaveWatcher:any = undefined;
	function enableAutoSave() {
		state.autosave = true;
		autosaveWatcher = watchDebounced(() => state.doc, save, {
			deep: true,
			debounce: 500,
		});
	}
	function disableAutoSave() {
		state.autosave = false;
		if (autosaveWatcher) {
			autosaveWatcher();
			autosaveWatcher = undefined;
		}
	}

	async function deleteChart() {
		state.deleting = true;
		await frappe.db.delete_doc(blockType, chartName);
		state.deleting = false;
	}
	return Object.assign(state, {
		load,
		save,
		updateQuery,
		enableAutoSave,
		disableAutoSave,
		delete: deleteChart,
	});
}
