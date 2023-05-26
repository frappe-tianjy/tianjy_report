import { defineAsyncComponent } from 'vue';

import Bar from './Bar/Bar.vue';
import BarOption from './Bar/BarOptions.vue';
import Table from './Table/Table.vue';
import TableOption from './Table/TableOptions.vue';
import Pie from './Pie/Pie.vue';
import PieOption from './Pie/PieOptions.vue';
import Line from './Line/Line.vue';
import LineOptions from './Line/LineOptions.vue';
import TextOptions from './Text/TextOptions.vue';
import Text from './Text/Text.vue';
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
	Line: {
		type: 'Line',
		icon: 'trending-up',
		component: Line,
		optionsComponent: LineOptions,
		options: {},
		defaultWidth: 10,
		defaultHeight: 8,
	},
	Bar: {
		type: 'Bar',
		icon: 'bar-chart',
		component: Bar,
		optionsComponent: BarOption,
		options: {},
		defaultWidth: 10,
		defaultHeight: 8,
	},
	Pie: {
		type: 'Pie',
		icon: 'pie-chart',
		component: Pie,
		optionsComponent: PieOption,
		options: {},
		defaultWidth: 10,
		defaultHeight: 8,
	},
	Table: {
		type: 'Table',
		icon: 'grid',
		component: Table,
		optionsComponent: TableOption,
		options: {},
		defaultWidth: 12,
		defaultHeight: 8,
	},
	Text: {
		type: 'Text',
		icon: 'align-left',
		component: Text,
		optionsComponent: TextOptions,
		options: {},
		defaultWidth: 10,
		defaultHeight: 2,
	},
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
