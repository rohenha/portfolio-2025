import { debounce } from "@js/utils/tools"
import type EventBus from "@js/classes/event-bus"

export interface ModuleConstructorParams {
	el: HTMLElement
	id: string
	dataName: string
	bus: EventBus
}

export default class Mmodule {
	public el: HTMLElement
	public id: string
	public dataName: string
	public moduleKey: string
	protected visible: boolean
	protected states: Record<string, any>
	protected bus: EventBus
	protected busEvents: Map<string, () => void>
	protected _busMap: Record<string, string>
	protected busMap: Record<string, string>;

	[key: string]: any

	constructor({ el, id, dataName, bus }: ModuleConstructorParams) {
		this.el = el
		this.dataName = dataName
		this.id = id
		this.moduleKey = `${dataName}:${id}`
		// this.moduleKey = `${this.constructor.name}:${id}`
		this.visible = false
		this.bus = bus
		this.busEvents = new Map()
		this._busMap = {
			"app:onUpdate": "onUpdate",
			call: "call",
		}
		this.busMap = {}
		this.states = {}
	}

	/**
	 * @description This method is called when the module is initialized. It's called internally by the library and should not be called directly. The mMount method is called after the module is fully initialized and the reactive state is set up.
	 */
	mount() {
		if (Object.keys(this.states).length > 0) {
			this.states = this.makeReactiveState(this.states)
		}
		this.initEvents()
		this.onMount()
	}

	/**
	 * @description This method is called when the module is initialized
	 * You can use this method to set up event listeners, fetch data, etc.
	 * Make sure to clean up any resources in the destroy method.
	 * @returns void
	 */
	onMount() {}

	/**
	 * @description This method is called when the module is destroyed. It's called internally by the library and should not be called directly. The mDestroy method is called before the module is fully destroyed .
	 */
	unmount() {
		this.removeEvents()
		this.onUnMount()
	}

	/**
	 * @description This method is called when the module is destroyed. You can use this method to clean up event listeners, cancel timers, etc. Make sure to call super.destroy() if you override this method in a subclass.
	 */
	onUnMount() {}

	on(event: string, handler: (payload?: any) => void) {
		const off = this.bus.on(event, handler)
		this.busEvents.set(event, off)
	}

	emit(event: string, payload?: any) {
		return this.bus.emit(event, payload)
	}

	emitAsync(event: string, payload?: any): Promise<any[]> {
		return this.bus.emitAsync(event, payload)
	}

	off(event: string) {
		const eventHandler = this.busEvents.get(event)
		if (!eventHandler) {
			return
		}
		eventHandler()
		this.busEvents.delete(event)
		this.bus.off(event, eventHandler)
	}

	initEvents() {
		const events = Object.assign({}, this._busMap, this.busMap)
		Object.keys(events).forEach((id) => {
			const handlerName = events[id]
			const handler = this[handlerName]
			if (typeof handler !== "function") {
				return
			}
			this.on(`${id}:${this.moduleKey}`, handler.bind(this))
		})
	}

	call({ method, payload }: { method: string; payload?: any }): any {
		if (typeof this[method] !== "function") {
			console.warn(`Method ${method} does not exist on module ${this.dataName}`)
			return
		}
		return this[method](payload)
	}

	removeEvents() {
		this.busEvents.forEach((off) => off())
		this.busEvents = new Map()
	}

	/**
	 * @description This method is called whenever the app is updated (add or remove modules, etc.).
	 */
	onPageUpdate() {}

	/**
	 * @description This method is called to toggle the view of the module. You can implement this method to show/hide elements, change styles, etc. The state parameter can be used to determine whether to show or hide the view.
	 * This method is automatically called when if you have activated the observe option in the module configuration and the module's root element enters or leaves the viewport. You can also call this method manually if needed.
	 * @param {boolean} state - The state to toggle the view. True to show, false to hide.
	 * @returns void
	 */
	updateView(state: boolean) {
		this.visible = state
		this.onUpdateView(state)
	}

	onUpdateView(state: boolean) {}
	/**
	 * @description This method is called when the window is resized. You can implement this method to adjust the layout, recalculate dimensions, etc. Make sure to debounce any expensive operations to avoid performance issues.
	 */
	onRender(params?: any): void {}

	/**
	 * @description This method is called to render the module. You can call this method to re-render the module
	 */
	render(params?: any): void {
		if (!this.visible) {
			return
		}
		this.onRender(params)
	}

	/**
	 * @description This method is called when the window is resized. You can implement this method to adjust the layout, recalculate dimensions, etc. You don't need to debounce this method, the library will handle it for you. Just implement the logic you want to execute on resize.
	 */
	onResize(): void {}

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

	animate(name: string, animate: () => void, keep: boolean = false) {
		this.emit("plugins:animations:add", {
			name: `${this.moduleKey}.${name}`,
			animation: { animate: animate, keep: keep },
		})
	}

	cleanAnimation(name: string): void {
		this.emit("plugins:animations:remove", `${this.moduleKey}.${name}`)
	}

	observe(state: boolean) {
		if (state) {
			this.emit("plugins:observer:on", {
				el: this.el,
				key: `${this.moduleKey}`,
			})
		} else {
			this.emit("plugins:observer:off", this.el)
		}
	}
}

export type ModuleConstructor = {
	new (params: ModuleConstructorParams): Mmodule
}
