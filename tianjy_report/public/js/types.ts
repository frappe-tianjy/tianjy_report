export interface Report {
	doctype: 'Tianjy Report';
	name: string;

	label: string;
	blocks: Block[];
	sources: Source[];
}

export interface Block {
	doctype: 'Tianjy Report Block';
	name: string;
	parent: string;

	type: string;
	options: object | string;
	sources: string[];
}
export interface Source {
	doctype: 'Tianjy Report Source';
	name: string;
	parent: string;

	source: string;
	options: object | string;
}

export interface Persistent {
	doctype: 'Tianjy Report Persistent';
	name: string;

	label: string;
	report: string;
	blocks: Block[];
	data: PersistentData[];
}

export interface PersistentData {
	doctype: 'Tianjy Report Persistent Data';
	name: string;
	parent: string;

	source: string;
	options: object | string;
	data: any;
}
