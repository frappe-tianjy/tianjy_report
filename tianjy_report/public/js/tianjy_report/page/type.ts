export interface ChartOptions{
		data:any[],
		columns:any[],
		loading:boolean,
		options?:Record<string, any>,
		autosave:boolean,
		deleting:boolean
		doc:{
			name?:string,
			type?:string,
			options:Record<string, any>,
			source_doctype?:string
			filter:[string, string, string, any][],
			dateFilter:DateFilter[],
			sources:any[]
			reportBlockName?:string
		}

	}
export interface ChartProvide extends ChartOptions{
	load?:()=>void,
	save?:()=>void,
	updateQuery?:(doctype:string, filter?:any)=>void,
	updateDateQuery?:(doctype:string, filter?:any)=>void,
	enableAutoSave?:()=>void,
	disableAutoSave?:()=>void,
	delete?: ()=>void,
}

export type DateFilter = [string, string, string, string]
