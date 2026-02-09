export interface ModuleConstructorParams {
	el: HTMLElement
	id: string
	// dataName: string
	call: (
		func: string,
		args: any,
		moduleType: string,
		moduleId?: string | undefined,
	) => Promise<any>
}

export default class Mmodule {
	public static readonly mAttr: string = "test"
	protected el: HTMLElement
	protected id: string
	// protected mAttr: string
	protected call: (
		func: string,
		args: any,
		moduleType: string,
		moduleId?: string | undefined,
	) => Promise<any>;

	// Ajouter cette signature d'index
	[key: string]: any

	constructor({ el, id, call }: ModuleConstructorParams) {
		this.el = el
		this.id = id
		// this.mAttr = "data-" + dataName
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
	mAttr: string
}
