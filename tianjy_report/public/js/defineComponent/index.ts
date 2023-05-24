
import { Component, Plugin, createApp } from 'vue';
import VueViewer from 'v-viewer';
import 'viewerjs/dist/viewer.css';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/dist/locale/zh-cn';
frappe.provide('frappe.guigu.vuelib');
export let vueComponents: Record<string, Record<string, Component>> = {};

export default function defineVueComponent(
	moduleName: string,
	name: string,
	VueComponent: Component,
) {
	if (!frappe.guigu.vuelib.components) {
		frappe.guigu.vuelib.components = {};
	}
	if (frappe.guigu.vuelib.components[moduleName]) {
		frappe.guigu.vuelib.components[moduleName] = { ...frappe.guigu.vuelib.components[moduleName], [name]: VueComponent };
	} else {
		frappe.guigu.vuelib.components = {
			...frappe.guigu.vuelib.components,
			[moduleName]: { [name]: VueComponent },
		};
	}
}

function renderComponent(
	el: string | Element,
	moduleName: string,
	component: string | Component,
	plugins?: { plugin: Plugin, options?: any }[]
) {

	const com = frappe.guigu.vuelib.components[moduleName] ? frappe.guigu.vuelib.components[moduleName][component] : component;
	const app = createApp(com, {});
	plugins?.forEach(item => {
		app.use(item.plugin, item.options);
	});
	app.use(VueViewer);
	app.use(ElementPlus, { size: 'small', locale: zhCn });
	app.mount(el);
	return app;
}
frappe.guigu.vuelib.utils = {
	defineVueComponent,
	renderComponent,
};
export { };
