import { reactive } from 'vue';

import { watchDebounced, watchOnce } from '@vueuse/core';
import { debounce } from 'lodash';
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

export async function createChart() {
	const res = await frappe.call<{message:{name:string}}>({
		method: 'tianjy_report.report.report.create_block',
	});
	return res?.message?.name||'';
}

export default function useChart(name:string) {
	if (!charts[name]) {
		charts[name] = getChart(name);
	}
	return charts[name];
}

function getChart(chartName:string) {
	const state = reactive<{
		data:any[],
		columns:any[],
		loading:boolean,
		options:Record<string, any>,
		autosave:boolean,
		deleting:boolean
		doc:{
			name?:string,
			type?:string,
			options:Record<string, any>,
			doc_type?:string
		}
	}>({
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
			doc_type:undefined,
		},
	});

	async function load() {
		state.loading = true;
		const block = await frappe.db.get_doc('Tianjy Report Block', chartName);
		if (block.options){
			block.options = safeJSONParse(block.options);
		}
		state.doc = block;
		if (!state.doc.doc_type) {
			state.loading = false;
			return;
		}
		updateChartData();
	}
	load();

	function updateChartData() {
		state.loading = true;
		// TODO 获取数据
		watchOnce(
			() => state.doc.doc_type,
			() => {
				if (!state.doc.doc_type) { return; }
				state.data = [{
					project:'project1',
					code:1,
				}, {
					project:'project2',
					code:2,
				}, {
					project:'project3',
					code:3,
				}];
				// 赋值给chart.data
				state.loading = false;
			}
		);
	}

	function save() {
		frappe.db.set_value('Tianjy Report Block', chartName, {
			type: state.doc.type,
			doc_type: state.doc.doc_type,
			options: state.doc.options,
		});
	}


	async function asyncUpdateQuery(doctype:string) {
		if (!doctype) { return; }
		if (state.doc.doc_type === doctype) { return; }
		state.doc.doc_type = doctype;
		await frappe.db.set_value('Tianjy Report Block', chartName, {
			doc_type:doctype,
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
		await frappe.db.delete_doc('Tianjy Report Block', chartName);
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
