export interface ModuleConstructorParams {
	el: HTMLElement
	id: string
	dataName: string
	call: (
		func: string,
		args: any,
		moduleType: string,
		moduleId?: string | undefined,
	) => Promise<any>
}

export default class Mmodule {
	protected el: HTMLElement
	protected id: string
	protected dataName?: string
	protected call: (
		func: string,
		args: any,
		moduleType: string,
		moduleId?: string | undefined,
	) => Promise<any>;

	// Ajouter cette signature d'index
	[key: string]: any

	constructor({ el, id, call, dataName }: ModuleConstructorParams) {
		this.el = el
		this.dataName = dataName
		this.id = id
		this.call = call
	}

	/**
	 * Initialize the module. This method is called when the module is created.
	 * You can use this method to set up event listeners, fetch data, etc.
	 * Make sure to clean up any resources in the destroy method.
	 * @returns void
	 */
	init() {}
	mInit() {}
	destroy() {}
	mDestroy() {}
	mUpdate() {}
	update() {}
	enter() {}
}

export type ModuleConstructor = {
	new (params: ModuleConstructorParams): Mmodule
}
