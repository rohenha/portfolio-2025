import Mmodule, { type ModuleConstructor } from "@js/classes/module"

interface ModulesRegistry {
	[moduleName: string]: ModuleConstructor
}

interface ModulesCurrent {
	[moduleId: string]: Mmodule
}

export default class ModulesManager {
	private modulesNames: { [moduleName: string]: string }
	private moduleId: number = 0
	private modules: ModulesRegistry = {}
	private currentModules: ModulesCurrent = {}
	private newModules: ModulesCurrent = {}

	constructor({ modules }: { modules: ModulesRegistry }) {
		this.modules = modules
		// Generate a mapping of module names to their lowercase versions for easier matching
		this.modulesNames = Object.keys(modules).reduce(
			(acc, moduleName) => {
				acc[moduleName] = this.camelToKebabCase(moduleName)
				return acc
			},
			{} as { [moduleName: string]: string },
		)
		this.callModuleFunction = this.callModuleFunction.bind(this)
	}

	/**
	 * @description Build an optimal CSS selector to find all elements that have a data attribute corresponding to any of the registered modules. This method is used internally by the addModules and removeModules methods to efficiently find elements that need to be initialized or destroyed.
	 * @return A string containing the CSS selector to find all elements with a data attribute corresponding to any of the registered modules.
	 */
	private buildOptimalSelector(): string {
		const selectors: Array<string> = []

		// Ajouter les modules connus
		Object.values(this.modulesNames).forEach((name) => {
			selectors.push(`[data-module-${name}]`)
		})

		return selectors.join(", ")
	}

	/**
	 * @description Add modules within the specified scope. This method is used internally by the update method to initialize new modules when they are added to the DOM.
	 * @param scope  HTMLElement or Document to limit the addition of modules. Only modules within this scope will be added.
	 * @returns void
	 */
	private addModules(scope: HTMLElement | Document) {
		const optimalSelector = this.buildOptimalSelector()
		const elementsModule = scope.querySelectorAll(optimalSelector)

		for (let i = 0; i < elementsModule.length; i += 1) {
			const element = elementsModule[i] as HTMLElement
			const moduleName = Object.keys(this.modulesNames).find((name) => {
				const value = this.modulesNames[name]
				return element.hasAttribute(`data-module-${value}`)
			})
			if (moduleName) {
				const moduleDataName = this.modulesNames[moduleName]
				let moduleId = element.getAttribute(`data-module-${moduleDataName}`)
				if (moduleId && this.currentModules[moduleId]) {
					// Module already exists, skip initialization
					continue
				}

				if (!moduleId) {
					// Generate a unique module ID and assign it to the element
					moduleId = `${moduleDataName}-${this.moduleId}`
					this.moduleId += 1
					element.setAttribute(`data-module-${moduleDataName}`, moduleId)
				}

				// Initialize the module and store the instance in newModules
				const moduleConstructor = this.modules[moduleName]
				const dataName = this.modulesNames[moduleName]
				const moduleInstance = new moduleConstructor({
					el: element,
					id: moduleId,
					dataName: dataName,
					call: this.callModuleFunction,
				})
				moduleInstance.mInit()
				this.newModules[moduleId] = moduleInstance
			} else {
				console.warn("No module found for element", element)
			}
		}
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
			const moduleName = Object.keys(this.modulesNames).find((name) => {
				const value = this.modulesNames[name]
				return element.hasAttribute(`data-module-${value}`)
			})
			if (!moduleName) {
				console.warn("No module found for element", element)
				continue
			}
			const moduleDataName = this.modulesNames[moduleName]
			const moduleId = element.getAttribute(`data-module-${moduleDataName}`)
			if (moduleId) {
				const moduleInstance = this.currentModules[moduleId]
				if (moduleInstance) {
					moduleInstance.mDestroy()
					moduleInstance.destroy()
					delete this.currentModules[moduleId]
				} else {
					console.warn(
						`No module instance found for module ${moduleName} with id ${moduleId}`,
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
	update(scope?: HTMLElement) {
		const container = scope || document
		this.addModules(container)

		Object.entries(this.newModules).forEach(([, moduleInstance]) => {
			moduleInstance.init()
		})

		Object.entries(this.currentModules).forEach(([, moduleInstance]) => {
			moduleInstance.mUpdate()
		})

		Object.entries(this.currentModules).forEach(([, moduleInstance]) => {
			moduleInstance.update()
		})

		Object.assign(this.currentModules, this.newModules)
		this.newModules = {}
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
	 * @description Convert a camelCase string to kebab-case.
	 * @param str The camelCase string to convert.
	 * @returns The converted kebab-case string.
	 */
	camelToKebabCase(str: string): string {
		return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
	}

	async callModuleFunction(
		func: string,
		args: any,
		moduleType: string,
		moduleId?: string,
	): Promise<any> {
		if (moduleId) {
			const moduleInstance = this.currentModules[moduleId]
			if (moduleInstance && typeof moduleInstance[func] === "function") {
				return moduleInstance[func](args)
			} else {
				console.warn(
					`No module instance found for module type ${moduleType} with id ${moduleId} or function ${func} does not exist`,
				)
			}
		} else {
			const modulesIds = Object.keys(this.currentModules).filter((id) =>
				id.startsWith(moduleType),
			)
			if (modulesIds.length === 0) {
				console.warn(`No module instances found for module type ${moduleType}`)
				return new Promise((resolve) => resolve(null))
			}
			const promises: Array<Promise<any>> = []
			modulesIds.forEach((id) => {
				const moduleInstance = this.currentModules[id]
				if (moduleInstance && typeof moduleInstance[func] === "function") {
					promises.push(moduleInstance[func](args))
				} else {
					console.warn(
						`No module instance found for module type ${moduleType} with id ${id} or function ${func} does not exist`,
					)
				}
			})
			return Promise.all(promises)
		}
	}
}
