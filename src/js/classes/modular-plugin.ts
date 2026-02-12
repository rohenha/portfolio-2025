import {
	type ModulesCurrent,
	type ModuleConfig,
	type ModulePluginInit,
} from "@js/classes/modular"

import type Mmodule from "@js/classes/module"

export interface ModularPluginMethod {
	instance: Mmodule
	config: ModuleConfig
}

export default class ModularPlugin {
	protected getModules: () => ModulesCurrent
	protected getConfigs: () => Array<ModuleConfig>
	public name: string;

	[key: string]: any

	constructor() {
		this.name = "ModularPlugin"
		this.getConfigs = () => []
		this.getModules = () => ({})
	}

	init({ getModules, getConfigs }: ModulePluginInit): void {
		this.getModules = getModules
		this.getConfigs = getConfigs
	}

	onModuleMount({}: ModularPluginMethod): void {}
	onModuleUnMount({}: ModularPluginMethod): void {}
	onUpdate(): void {}
}
