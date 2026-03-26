import EventBus from "@js/classes/event-bus"

import type Mmodule from "@js/classes/module"

export interface ModulePluginInit {
	bus: EventBus
	params?: any
}

export interface ModularPluginMethod {
	instance: Mmodule
}

export default class ModularPlugin {
	public name: string = "ModularPlugin"
	protected bus: EventBus
	protected busEvents: Map<string, () => void>
	protected _busMap: Record<string, string>
	protected busMap: Record<string, string>;

	[key: string]: any

	constructor({ bus, params = {} }: ModulePluginInit) {
		this.bus = bus
		this.busEvents = new Map()
		this._busMap = {
			"app:module:onMount": "onModuleMount",
			"app:module:onUnMount": "onModuleUnMount",
		}
		this.busMap = {}
	}

	mount() {
		this.initEvents()
		this.onMount()
	}

	onMount(): void {}

	emit(event: string, payload?: any) {
		return this.bus.emit(event, payload)
	}

	emitAsync(event: string, payload?: any): Promise<any[]> {
		return this.bus.emitAsync(event, payload)
	}

	on(event: string, handler: (payload?: any) => void) {
		const off = this.bus.on(event, handler)
		this.busEvents.set(event, off)
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
			this.on(id, handler.bind(this))
		})
	}
}
