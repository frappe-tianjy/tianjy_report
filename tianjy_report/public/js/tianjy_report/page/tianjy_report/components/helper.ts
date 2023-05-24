import { reactive } from 'vue';

import { watchDebounced, watchOnce } from '@vueuse/core';
import { debounce } from 'lodash';

import { ChartOptions, ChartProvide } from '../../type';

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
	debugger;
	return res?.name||'';
}

export default function useChart(name:string, mode:string|null) {
	if (!charts[name]) {
		charts[name] = getChart(name, mode);
	}
	return charts[name];
}

function getChart(chartName:string, mode:string|null):ChartProvide {
	const blockType = mode==='template'?'Tianjy Report Template Block':'Tianjy Report Block';
	const state = reactive<ChartOptions>({
		data: [],
		columns: [],
		loading: false,
		options: {},
		autosave: false,
		deleting:false,
		doc: {
			name: undefined,
			type: undefined,
			options: {},
			filter:undefined,
			source_doctype:undefined,
		},
	});

	async function load() {
		state.loading = true;
		const block = await frappe.db.get_doc(blockType, chartName);
		if (block.options){
			block.options = safeJSONParse(block.options);
		} else {
			block.options = {};
		}
		state.doc = block;
		state.doc.filter = safeJSONParse(block.filter);
		if (!state.doc.source_doctype) {
			state.loading = false;
			return;
		}
		updateChartData();
	}
	load();

	async function updateChartData() {
		state.loading = true;
		if (!state.doc.source_doctype){ return; }
		const list = await frappe.db.get_list(state.doc.source_doctype,
			{
				limit:0,
				fields:['*'],
				filters:state.doc.filter??undefined,
			});
		if (!state.doc.source_doctype) { return; }
		state.data = list;
		// 赋值给chart.data
		state.loading = false;
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
