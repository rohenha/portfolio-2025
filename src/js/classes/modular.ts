import EventBus from "@js/classes/event-bus"
import Mmodule, { type ModuleConstructor } from "@js/classes/module"
import ModularPlugin from "@js/classes/modular-plugin"
import { map } from "astro:schema"
export interface ModulesCurrent {
	[moduleId: string]: Mmodule
}

export interface ModuleConfig {
	name: string
	module?: ModuleConstructor
	loader?: () => Promise<{ default: ModuleConstructor }>
}

export default class ModulesManager {
	// Allow dynamic property access by string key
	[key: string]: any

	private moduleId: number = 0
	private modules: Map<string, ModuleConfig> = new Map()
	private currentModules: Map<string, Mmodule> = new Map()
	private newModules: Map<string, Mmodule> = new Map()
	private plugins: Map<string, ModularPlugin> = new Map()
	private bus: EventBus

	constructor({
		modules,
		plugins,
		parent,
	}: {
		modules: Array<ModuleConfig>
		observer?: IntersectionObserverInit
		plugins?: Array<[typeof ModularPlugin, (any | null)?]>
		parent?: HTMLElement | Document | null
		optimalSelector?: string
	}) {
		this.modules = new Map(modules.map((module) => [module.name, module]))
		this.bus = new EventBus()
		this.plugins = this.initPlugins(plugins || [])
		this.optimalSelector = this.buildOptimalSelector()
		this.initEvents()
		this.update({ scope: parent || document, init: true })
	}

	initPlugins(
		plugins: Array<[typeof ModularPlugin, (any | null)?]>,
	): Map<string, ModularPlugin> {
		const mapPlugins =
			plugins?.reduce(
				(acc, plugin) => {
					const instance = new plugin[0]({
						bus: this.bus,
						params: plugin[1] ?? null,
					})
					acc.set(instance.name, instance)
					return acc
				},
				new Map() as Map<string, ModularPlugin>,
			) || new Map()

		mapPlugins.forEach((plugin) => {
			plugin.mount()
		})

		return mapPlugins
	}

	initEvents() {
		this.bus.on("app:update", this.update.bind(this))
		this.bus.on("app:destroy", this.destroy.bind(this))
	}

	/**
	 * @description Build an optimal CSS selector to find all elements that have a data attribute corresponding to any of the registered modules. This method is used internally by the addModules and removeModules methods to efficiently find elements that need to be initialized or destroyed.
	 * @return A string containing the CSS selector to find all elements with a data attribute corresponding to any of the registered modules.
	 */
	private buildOptimalSelector(): string {
		const selectors = Array.from(this.modules.keys(), (name) => {
			return `[data-module-${name}]`
		})
		return selectors.join(", ")
	}

	/**
	 * @description Add modules within the specified scope. This method is used internally by the update method to initialize new modules when they are added to the DOM.
	 * @param scope  HTMLElement or Document to limit the addition of modules. Only modules within this scope will be added.
	 * @returns void
	 */
	private async mountModules(
		scope: HTMLElement | Document,
	): Promise<void[] | void> {
		const promises: Array<Promise<void>> = []
		const elementsModule = scope.querySelectorAll(this.optimalSelector)

		elementsModule.forEach((element) => {
			this.modules.forEach((moduleItem, name) => {
				if (element.hasAttribute(`data-module-${name}`)) {
					promises.push(this.mountModule(element, moduleItem))
				}
			})
		})
		return Promise.all(promises)
	}

	/**
	 * @description Load a module constructor. If the module is already loaded, it returns the constructor immediately. If the module has a loader function, it calls the loader to load the module asynchronously and then returns the constructor.
	 * @param moduleItem ModuleConfig object containing the information about the module to load.
	 * @returns A promise that resolves to the module constructor.
	 */
	async loadModule(moduleItem: ModuleConfig): Promise<ModuleConstructor> {
		let moduleConstructor = moduleItem.module
		if (moduleConstructor) {
			return Promise.resolve(moduleConstructor)
		}
		if (!moduleItem.loader) {
			throw new Error(
				`No module constructor or loader found for module ${moduleItem.name}`,
			)
		}
		const moduleClass = await moduleItem.loader()
		moduleItem.module = moduleClass.default
		moduleItem.loader = undefined
		moduleConstructor = moduleItem.module
		return moduleConstructor
	}

	/**
	 * @description Add a module to a specific element. This method is used internally by the addModules method to initialize a module on an element that has the corresponding data attribute.
	 * @param element HTMLElement on which to initialize the module.
	 * @param moduleItem ModuleConfig object containing the information about the module to initialize.
	 * @returns void
	 */
	async mountModule(element: Element, moduleItem: ModuleConfig): Promise<void> {
		let moduleId = element.getAttribute(`data-module-${moduleItem.name}`)
		if (this.currentModules.get(moduleId ?? "")) {
			// Module already exists, skip initialization
			// resolve()
			return
		}

		try {
			let moduleConstructor = await this.loadModule(moduleItem)

			if (!moduleId) {
				// Generate a unique module ID and assign it to the element
				moduleId = `m${this.moduleId}`
				this.moduleId += 1
				element.setAttribute(`data-module-${moduleItem.name}`, moduleId)
			}

			const moduleInstance = new moduleConstructor({
				el: element,
				id: moduleId,
				dataName: moduleItem.name,
				bus: this.bus,
			})
			moduleInstance.mount()
			this.bus.emit("app:module:onMount", {
				instance: moduleInstance,
				config: moduleItem,
			})
			this.newModules.set(moduleId, moduleInstance)
		} catch (error) {
			console.error(`Error loading module ${moduleItem.name}:`, error)
		}
	}

	/**
	 * @description Remove modules within the specified scope. This method is used internally by the destroy method to clean up modules when they are removed from the DOM.
	 * @param scope  HTMLElement or Document to limit the removal of modules. Only modules within this scope will be removed.
	 * @returns void
	 */
	private unmountModules(scope: HTMLElement | Document) {
		const elementsModule = scope.querySelectorAll(this.optimalSelector)
		elementsModule.forEach((element) => {
			this.modules.forEach((moduleItem, name) => {
				if (!element.hasAttribute(`data-module-${name}`)) {
					return
				}
				console.log("Unmounting module", name)
				const moduleId = element.getAttribute(`data-module-${name}`) as string
				const moduleInstance = this.currentModules.get(moduleId ?? "")
				if (!moduleInstance) {
					return
				}
				moduleInstance.unmount()
				this.bus.emit("app:module:onUnMount", {
					instance: moduleInstance,
				})
				this.currentModules.delete(moduleId)
			})
		})
	}

	/**
	 * @description Update the modules within the specified scope. If no scope is provided, it will update all modules in the document. Use it to initialize modules after the initial load or to update modules after an AJAX request, for example.
	 * @param scope Optional HTMLElement to limit the update of modules. If not provided, all modules in the document will be updated.
	 * @returns void
	 */
	async update({
		scope,
		init = false,
	}: {
		scope?: HTMLElement | Document
		init: boolean
	}): Promise<void> {
		return new Promise(async (resolve) => {
			const container = scope || document
			await this.mountModules(container)

			if (!init) {
				this.bus.emit("app:onUpdate")
			}

			this.currentModules = new Map([
				...this.currentModules,
				...this.newModules,
			])
			this.newModules = new Map()

			resolve()
		})
	}

	/**
	 * @description Destroy all modules within the specified scope. If no scope is provided, it will destroy all modules in the document.
	 * @param scope Optional HTMLElement to limit the destruction of modules. If not provided, all modules in the document will be destroyed.
	 * @returns void
	 */
	destroy({ scope }: { scope?: HTMLElement }) {
		this.unmountModules(scope ?? document)
	}
}
