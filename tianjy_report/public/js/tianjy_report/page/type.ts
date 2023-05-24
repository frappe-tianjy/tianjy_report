export interface ChartOptions{
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
			source_doctype?:string
		}

	}
export interface ChartProvide extends ChartOptions{
	load:()=>void,
	save:()=>void,
	updateQuery:(doctype:string)=>void,
	enableAutoSave:()=>void,
	disableAutoSave:()=>void,
	delete: ()=>void,
}
