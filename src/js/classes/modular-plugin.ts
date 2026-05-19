import EventBus from "@js/classes/event-bus"
import EventEmitter from "@js/classes/event-emitter"

import type Mmodule from "@js/classes/module"

export interface ModulePluginInit {
	bus: EventBus
	params?: any
}

export interface ModularPluginMethod {
	instance: Mmodule
}

export default class ModularPlugin extends EventEmitter {
	public name: string = "ModularPlugin"

	constructor({ bus }: ModulePluginInit) {
		super(bus)
		this._busMap = {
			"app:module:onMount": "onModuleMount",
			"app:module:onUnMount": "onModuleUnMount",
		}
	}

	mount() {
		this.initEvents()
		this.onMount()
	}

	onMount(): void {}

	unmount(): void {
		this.removeEvents()
	}
}
