import Mmodule, { type ModuleConstructor } from "@js/classes/module"
import { type ModuleConfig } from "@js/modules/index"

interface ModulesCurrent {
	[moduleId: string]: Mmodule
}

export default class ModulesManager {
	// Allow dynamic property access by string key
	[key: string]: any

	// private modulesNames: Array<string>
	private moduleId: number = 0
	private modules: Array<ModuleConfig> = []
	private currentModules: ModulesCurrent = {}
	private newModules: ModulesCurrent = {}

	constructor({ modules }: { modules: Array<ModuleConfig> }) {
		this.modules = modules
		this.callModuleFunction = this.callModuleFunction.bind(this)
		console.log(this)
	}

	/**
	 * @description Build an optimal CSS selector to find all elements that have a data attribute corresponding to any of the registered modules. This method is used internally by the addModules and removeModules methods to efficiently find elements that need to be initialized or destroyed.
	 * @return A string containing the CSS selector to find all elements with a data attribute corresponding to any of the registered modules.
	 */
	private buildOptimalSelector(): string {
		const selectors: Array<string> = this.modules.reduce((acc, moduleItem) => {
			acc.push(`[data-module-${moduleItem.name}]`)
			return acc
		}, [] as Array<string>)

		return selectors.join(", ")
	}

	/**
	 * @description Add modules within the specified scope. This method is used internally by the update method to initialize new modules when they are added to the DOM.
	 * @param scope  HTMLElement or Document to limit the addition of modules. Only modules within this scope will be added.
	 * @returns void
	 */
	private async addModules(
		scope: HTMLElement | Document,
	): Promise<void[] | void> {
		const promises: Array<Promise<void>> = []
		const optimalSelector = this.buildOptimalSelector()
		const elementsModule = scope.querySelectorAll(optimalSelector)

		for (let i = 0; i < elementsModule.length; i += 1) {
			const element = elementsModule[i] as HTMLElement
			const moduleItems = this.modules.filter((moduleItem) => {
				return element.hasAttribute(`data-module-${moduleItem.name}`)
			})
			if (moduleItems.length === 0) {
				console.warn("No module found for element", element)
				continue
			}
			for (let j = 0; j < moduleItems.length; j += 1) {
				const moduleItem = moduleItems[j]
				promises.push(this.addModule(element, moduleItem))
			}
		}
		return Promise.all(promises)
	}

	/**
	 * @description Add a module to a specific element. This method is used internally by the addModules method to initialize a module on an element that has the corresponding data attribute.
	 * @param element HTMLElement on which to initialize the module.
	 * @param moduleItem ModuleConfig object containing the information about the module to initialize.
	 * @returns void
	 */
	async addModule(
		element: HTMLElement,
		moduleItem: ModuleConfig,
	): Promise<void> {
		return new Promise(async (resolve) => {
			let moduleId = element.getAttribute(`data-module-${moduleItem.name}`)
			if (moduleId && this.currentModules[moduleId]) {
				// Module already exists, skip initialization
				resolve()
				return
			}

			if (!moduleId) {
				// Generate a unique module ID and assign it to the element
				moduleId = `m${this.moduleId}`
				this.moduleId += 1
				element.setAttribute(`data-module-${moduleItem.name}`, moduleId)
			}
			let moduleConstructor = moduleItem.module
			if (!moduleConstructor && moduleItem.loader) {
				const moduleClass = await moduleItem.loader()
				moduleItem.module = moduleClass.default
				moduleItem.loader = undefined
				moduleConstructor = moduleItem.module
			}
			if (moduleConstructor) {
				this.initModule(element, moduleItem, moduleId, moduleConstructor)
			}
			resolve()
		})
	}

	/**
	 * @description Initialize a module on a specific element. This method is used internally by the addModule method to create an instance of the module and call its init method.
	 * @param element HTMLElement on which to initialize the module.
	 * @param moduleItem ModuleConfig object containing the information about the module to initialize.
	 * @param moduleId string containing the unique ID of the module instance.
	 * @param moduleConstructor ModuleConstructor function to create an instance of the module.
	 * @returns void
	 */
	initModule(
		element: HTMLElement,
		moduleItem: ModuleConfig,
		moduleId: string,
		moduleConstructor: ModuleConstructor,
	): void {
		const moduleInstance = new moduleConstructor({
			el: element,
			id: moduleId,
			dataName: moduleItem.name,
			call: this.callModuleFunction,
		})
		moduleInstance.mInit()
		this.newModules[moduleId] = moduleInstance
	}

	/**
	 * @description Remove modules within the specified scope. This method is used internally by the destroy method to clean up modules when they are removed from the DOM.
	 * @param scope  HTMLElement or Document to limit the removal of modules. Only modules within this scope will be removed.
	 * @returns void
	 */
	private removeModules(scope: HTMLElement | Document) {
		const optimalSelector = this.buildOptimalSelector()
		const elementsModule = scope.querySelectorAll(optimalSelector)
		// console.log(elementsModule)
		for (let i = 0; i < elementsModule.length; i += 1) {
			const element = elementsModule[i] as HTMLElement
			const moduleItem = this.modules.find((moduleItem) => {
				return element.hasAttribute(`data-module-${moduleItem.name}`)
			})
			if (!moduleItem) {
				console.warn("No module found for element", element)
				continue
			}
			const moduleId = element.getAttribute(`data-module-${moduleItem.name}`)
			if (moduleId) {
				const moduleInstance = this.currentModules[moduleId]
				if (moduleInstance) {
					moduleInstance.mDestroy()
					moduleInstance.destroy()
					delete this.currentModules[moduleId]
				} else {
					console.warn(
						`No module instance found for module ${moduleItem.name} with id ${moduleId}`,
					)
				}
			}
		}
	}

	/**
	 * @description Update the modules within the specified scope. If no scope is provided, it will update all modules in the document. Use it to initialize modules after the initial load or to update modules after an AJAX request, for example.
	 * @param scope Optional HTMLElement to limit the update of modules. If not provided, all modules in the document will be updated.
	 * @returns void
	 */
	async update(scope?: HTMLElement): Promise<void> {
		return new Promise(async (resolve) => {
			const container = scope || document
			await this.addModules(container)

			Object.entries(this.newModules).forEach(([, moduleInstance]) => {
				moduleInstance.init()
			})

			Object.entries(this.currentModules).forEach(([, moduleInstance]) => {
				moduleInstance.update()
			})

			Object.assign(this.currentModules, this.newModules)
			this.newModules = {}
			resolve()
		})
	}

	/**
	 * @description Destroy all modules within the specified scope. If no scope is provided, it will destroy all modules in the document.
	 * @param scope Optional HTMLElement to limit the destruction of modules. If not provided, all modules in the document will be destroyed.
	 * @returns void
	 */
	destroy(scope?: HTMLElement) {
		if (scope) {
			this.removeModules(scope)
		} else {
			this.removeModules(document)
		}
	}

	/**
	 * @description Call a function on a specific module instance or on all instances of a module type.
	 * @param func string containing the name of the function to call on the module instance(s).
	 * @param args any containing the arguments to pass to the function when calling it on the module instance(s).
	 * @param moduleType string containing the name of the module type on which to call the function.
	 * @param moduleId Optional string containing the unique ID of the module instance on which to call the function. If not provided, the function will be called on all instances of the specified module type.
	 * @returns Promise that resolves with the result of the function call(s) on the module instance(s).
	 */
	async callModuleFunction(
		func: string,
		args: any,
		moduleType: string,
		moduleId?: string,
	): Promise<any> {
		if (moduleType === "self") {
			if (typeof this[func] === "function") {
				return this[func](args)
			}
			return Promise.resolve(null)
		}
		if (moduleId) {
			const moduleInstance = this.currentModules[moduleId]
			if (moduleInstance && typeof moduleInstance[func] === "function") {
				return moduleInstance[func](args)
			} else {
				console.warn(
					`No module instance found for module type ${moduleType} with id ${moduleId} or function ${func} does not exist`,
				)
				return Promise.resolve(null)
			}
		} else {
			const modulesItems = Object.values(this.currentModules).filter(
				(moduleInstance) => moduleInstance.constructor.name === moduleType,
			)
			if (modulesItems.length === 0) {
				console.warn(`No module instances found for module type ${moduleType}`)
				return new Promise((resolve) => resolve(null))
			}
			const promises: Array<Promise<any>> = []
			modulesItems.forEach((moduleInstance) => {
				// const moduleInstance = this.currentModules[id]
				if (moduleInstance && typeof moduleInstance[func] === "function") {
					promises.push(moduleInstance[func](args))
				} else {
					console.warn(
						`No module instance found for module type ${moduleType} function ${func} does not exist`,
					)
				}
			})
			return Promise.all(promises)
		}
	}
}
