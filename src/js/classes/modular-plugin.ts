import { type ModuleConfig } from "@js/classes/modular"
import EventBus from "@js/classes/event-bus"

import type Mmodule from "@js/classes/module"

export interface ModulePluginInit {
	getModules: () => Map<string, Mmodule>
	getConfigs: () => Array<ModuleConfig>
	bus: EventBus
	params?: any
}

export interface ModularPluginMethod {
	instance: Mmodule
	config: ModuleConfig
}

export default class ModularPlugin {
	protected getModules: () => Map<string, Mmodule>
	protected getConfigs: () => Array<ModuleConfig>
	protected bus: EventBus
	public name: string;

	[key: string]: any

	constructor({ getModules, getConfigs, bus, params = {} }: ModulePluginInit) {
		this.name = "ModularPlugin"
		this.getModules = getModules
		this.getConfigs = getConfigs
		this.bus = bus
		// this.getConfigs = () => []
		// this.getModules = () => new Map()
		// this.bus = null
	}

	// mount({ getModules, getConfigs, bus }: ModulePluginInit): void {
	// }

	onModuleMount({}: ModularPluginMethod): void {}
	onModuleUnMount({}: ModularPluginMethod): void {}
	onUpdate(): void {}
}
