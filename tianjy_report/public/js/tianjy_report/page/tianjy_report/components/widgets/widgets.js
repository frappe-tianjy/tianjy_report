import { defineAsyncComponent } from 'vue';

import Bar from './Bar/Bar.vue';
const VALID_CHARTS = ['Number', 'Line', 'Bar', 'Pie', 'Table'];

const WIDGETS = {
	// Number: {
	// 	type: 'Number',
	// 	icon: 'hash',
	// 	component: defineAsyncComponent(() => import('./Number/Number.vue')),
	// 	optionsComponent: defineAsyncComponent(() => import('./Number/NumberOptions.vue')),
	// 	options: {},
	// 	defaultWidth: 4,
	// 	defaultHeight: 4,
	// },
	// Line: {
	// 	type: 'Line',
	// 	icon: 'trending-up',
	// 	component: defineAsyncComponent(() => import('./Line/Line.vue')),
	// 	optionsComponent: defineAsyncComponent(() => import('./Line/LineOptions.vue')),
	// 	options: {},
	// 	defaultWidth: 10,
	// 	defaultHeight: 8,
	// },
	Bar: {
		type: 'Bar',
		icon: 'bar-chart',
		// component: defineAsyncComponent(() => import('./Bar/Bar.vue')),
		component: Bar,
		// optionsComponent: defineAsyncComponent(() => import('./Bar/BarOptions.vue')),
		options: {},
		defaultWidth: 10,
		defaultHeight: 8,
	},
	// Pie: {
	// 	type: 'Pie',
	// 	icon: 'pie-chart',
	// 	component: defineAsyncComponent(() => import('./Pie/Pie.vue')),
	// 	optionsComponent: defineAsyncComponent(() => import('./Pie/PieOptions.vue')),
	// 	options: {},
	// 	defaultWidth: 10,
	// 	defaultHeight: 8,
	// },
	// Table: {
	// 	type: 'Table',
	// 	icon: 'grid',
	// 	component: defineAsyncComponent(() => import('./Table/Table.vue')),
	// 	optionsComponent: defineAsyncComponent(() => import('./Table/TableOptions.vue')),
	// 	options: {},
	// 	defaultWidth: 12,
	// 	defaultHeight: 8,
	// },
	// Filter: {
	// 	type: 'Filter',
	// 	icon: 'filter',
	// 	component: defineAsyncComponent(() => import('./Filter/Filter.vue')),
	// 	optionsComponent: defineAsyncComponent(() => import('./Filter/FilterOptions.vue')),
	// 	options: {},
	// 	defaultWidth: 5,
	// 	defaultHeight: 2,
	// },
	// Text: {
	// 	type: 'Text',
	// 	icon: 'align-left',
	// 	component: defineAsyncComponent(() => import('./Text/Text.vue')),
	// 	optionsComponent: defineAsyncComponent(() => import('./Text/TextOptions.vue')),
	// 	options: {},
	// 	defaultWidth: 10,
	// 	defaultHeight: 2,
	// },
};

const UnknownWidget = {
	type: 'Unknown',
	icon: 'question',
	component: defineAsyncComponent(() => import('./InvalidWidget.vue')),
	optionsComponent: null,
	options: {},
	defaultWidth: 5,
	defaultHeight: 4,
};

function get(itemType) {
	return WIDGETS[itemType] || UnknownWidget;
}

function getComponent(itemType) {
	return get(itemType).component;
}

function getOptionComponent(itemType) {
	return get(itemType).optionsComponent;
}

function getChartOptions() {
	return VALID_CHARTS.map(chart => ({
		value: chart,
		label: chart,
	}));
}

export default {
	...WIDGETS,
	list: Object.values(WIDGETS),
	get,
	getComponent,
	getOptionComponent,
	getChartOptions,
};
