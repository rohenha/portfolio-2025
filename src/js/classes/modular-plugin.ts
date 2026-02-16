import { type ModuleConfig } from "@js/classes/modular"
import EventBus from "@js/classes/event-bus"

import type Mmodule from "@js/classes/module"

export interface ModulePluginInit {
	bus: EventBus
	params?: any
}

export interface ModularPluginMethod {
	instance: Mmodule
	config: ModuleConfig
}

export default class ModularPlugin {
	public name: string = "ModularPlugin"
	protected bus: EventBus;

	[key: string]: any

	constructor({ bus, params = {} }: ModulePluginInit) {
		this.bus = bus
	}
}
