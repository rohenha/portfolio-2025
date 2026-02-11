import { debounce } from "@js/utils/tools"

export interface ModuleConstructorParams {
	el: Element
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
	public el: Element
	public id: string
	protected dataName?: string
	protected visible: boolean
	protected rafRender: number | null
	protected states: Record<string, any>
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
		this.visible = false
		this.rafRender = null
		this.call = call
		this.toRender = false
		this.states = {}
	}

	/**
	 * @description This method is called when the module is initialized
	 * You can use this method to set up event listeners, fetch data, etc.
	 * Make sure to clean up any resources in the destroy method.
	 * @returns void
	 */
	onMount() {}
	/**
	 * @description This method is called when the module is initialized. It's called internally by the library and should not be called directly. The mMount method is called after the module is fully initialized and the reactive state is set up.
	 */
	mount() {
		if (Object.keys(this.states).length > 0) {
			this.states = this.makeReactiveState(this.states)
		}
	}
	/**
	 * @description This method is called when the module is destroyed. You can use this method to clean up event listeners, cancel timers, etc. Make sure to call super.destroy() if you override this method in a subclass.
	 */
	onUnmount() {
		console.log(`Module ${this.dataName} with ID ${this.id} destroyed`)
	}
	/**
	 * @description This method is called when the module is destroyed. It's called internally by the library and should not be called directly. The mDestroy method is called before the module is fully destroyed .
	 */
	unmount() {}
	onUpdate() {}

	/**
	 * @description This method is called to toggle the view of the module. You can implement this method to show/hide elements, change styles, etc. The state parameter can be used to determine whether to show or hide the view.
	 * This method is automatically called when if you have activated the observe option in the module configuration and the module's root element enters or leaves the viewport. You can also call this method manually if needed.
	 * @param {boolean} state - The state to toggle the view. True to show, false to hide.
	 * @returns void
	 */
	viewUpdate(state: boolean) {
		this.visible = state
		this.render()
		this.onViewUpdate(state)
	}
	onViewUpdate(state: boolean) {}
	/**
	 * @description This method is called when the window is resized. You can implement this method to adjust the layout, recalculate dimensions, etc. Make sure to debounce any expensive operations to avoid performance issues.
	 */
	onRender(): void {}

	/**
	 * @description This method is called to render the module. You can call this method to re-render the module
	 */
	render() {
		if (!this.toRender || !this.visible) {
			return
		}
		window.cancelAnimationFrame(this.rafRender!)
		this.rafRender = window.requestAnimationFrame(() => {
			this.onRender()
		})
	}

	/**
	 * @description This method is called when the window is resized. You can implement this method to adjust the layout, recalculate dimensions, etc. You don't need to debounce this method, the library will handle it for you. Just implement the logic you want to execute on resize.
	 */
	onResize() {}

	/**
	 * @description Select elements within the module's root element using a data attribute.
	 * For example, if dataName is "app", you can select elements with data-app="selector".
	 * @param {string} selector - The value of the data attribute to select.
	 * @param {HTMLElement} [context] - Optional context to search within. Defaults to the module's root element.
	 * @returns {Array<HTMLElement>} An array of matching elements.
	 */
	$(selector: string, context?: HTMLElement): Array<HTMLElement> {
		const parent = context || this.el
		return Array.from(
			parent.querySelectorAll(`[data-${this.dataName}="${selector}"]`),
		)
	}

	/**
	 * @description Generic onClick handler that delegates to methods based on data-action attribute
	 * @param {Event} event - The click event
	 */
	onClick(event: MouseEvent) {
		const { target } = event
		if (!(target instanceof HTMLElement)) {
			return
		}
		const { action } = target.dataset
		if (action && typeof this[action] === "function") {
			this[action](event)
		}
	}

	/**
	 * @description This method is called whenever a reactive state property is updated. You can implement this method to perform side effects, trigger additional renders, etc. The library will automatically debounce calls to this method to avoid performance issues.
	 */
	onWatch<T extends Record<string, any>>(newValue: T, oldValue: T) {}

	/**
	 * @description Create a reactive state object. When any property of the state is updated, the module will automatically re-render.
	 * @param {object} initialState - The initial state object.
	 * @returns {object} A reactive state object.
	 */
	protected makeReactiveState<T extends Record<string, any>>(
		initialState: T,
	): T {
		const debouncedWatch = debounce(this.onWatch.bind(this), 50)
		return new Proxy(initialState, {
			set: (target, prop, value) => {
				const oldTarget = { ...initialState }
				target[prop as keyof T] = value
				debouncedWatch(target, oldTarget)
				return true
			},
		})
	}
}

export type ModuleConstructor = {
	new (params: ModuleConstructorParams): Mmodule
}
