import Mmodule from "@js/classes/module"
import { debounce } from "@js/utils/tools"
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
	private observer: IntersectionObserver
	private resizeModules: Array<string> = []
	private resizing: boolean = false
	private resizeHandler: () => void

	constructor({
		modules,
		observer,
	}: {
		modules: Array<ModuleConfig>
		observer?: IntersectionObserverInit
	}) {
		this.modules = modules
		this.resizeModules = []
		this.callModuleFunction = this.callModuleFunction.bind(this)
		const observerOptions = observer || {
			root: null,
			rootMargin: "0px",
			threshold: 0.1,
		}
		this.observer = new IntersectionObserver(
			this.handleIntersect.bind(this),
			observerOptions,
		)
		this.resizing = false
		this.resizeHandler = debounce(this.resize.bind(this), 200)
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

		// for (let i = 0; i < elementsModule.length; i += 1) {
		elementsModule.forEach((element) => {
			// const element = elementsModule[i] as HTMLElement
			const moduleItems = this.modules.filter((moduleItem) => {
				return element.hasAttribute(`data-module-${moduleItem.name}`)
			})
			// for (let j = 0; j < moduleItems.length; j += 1) {
			moduleItems.forEach((moduleItem) => {
				// const moduleItem = moduleItems[j]
				promises.push(this.addModule(element, moduleItem))
			})
			// }
		})
		// }
		return Promise.all(promises)
	}

	/**
	 * @description Add a module to a specific element. This method is used internally by the addModules method to initialize a module on an element that has the corresponding data attribute.
	 * @param element HTMLElement on which to initialize the module.
	 * @param moduleItem ModuleConfig object containing the information about the module to initialize.
	 * @returns void
	 */
	async addModule(element: Element, moduleItem: ModuleConfig): Promise<void> {
		return new Promise(async (resolve) => {
			let moduleId = element.getAttribute(`data-module-${moduleItem.name}`)
			if (moduleId && this.currentModules[moduleId]) {
				// Module already exists, skip initialization
				resolve()
				return
			}

			let moduleConstructor = moduleItem.module
			if (!moduleConstructor && moduleItem.loader) {
				const moduleClass = await moduleItem.loader()
				moduleItem.module = moduleClass.default
				moduleItem.loader = undefined
				moduleConstructor = moduleItem.module
			}
			if (!moduleConstructor) {
				console.warn(
					`No module constructor found for module ${moduleItem.name}`,
				)
				resolve()
				return
			}

			if (moduleItem.observe) {
				this.observer.observe(element)
			}

			if (!moduleId) {
				// Generate a unique module ID and assign it to the element
				moduleId = `m${this.moduleId}`
				this.moduleId += 1
				element.setAttribute(`data-module-${moduleItem.name}`, moduleId)
			}

			if (moduleItem.resize) {
				this.resizeModules.push(moduleId)
			}

			const moduleInstance = new moduleConstructor({
				el: element,
				id: moduleId,
				dataName: moduleItem.name,
				call: this.callModuleFunction,
			})
			moduleInstance.mMount()
			this.newModules[moduleId] = moduleInstance
			resolve()
		})
	}

	/**
	 * @description Remove modules within the specified scope. This method is used internally by the destroy method to clean up modules when they are removed from the DOM.
	 * @param scope  HTMLElement or Document to limit the removal of modules. Only modules within this scope will be removed.
	 * @returns void
	 */
	private removeModules(scope: HTMLElement | Document) {
		const optimalSelector = this.buildOptimalSelector()
		const elementsModule = scope.querySelectorAll(optimalSelector)
		console.log("removeModules", elementsModule)
		const idsResizeToRemove: Array<string> = []
		elementsModule.forEach((element) => {
			// for (let i = 0; i < elementsModule.length; i += 1) {
			// const element = elementsModule[i] as HTMLElement
			const moduleItems = this.modules.filter((moduleItem) => {
				return element.hasAttribute(`data-module-${moduleItem.name}`)
			})
			moduleItems.forEach((moduleItem) => {
				const moduleId = element.getAttribute(`data-module-${moduleItem.name}`)
				if (!moduleId) {
					return
				}
				if (this.resizeModules.includes(moduleId)) {
					idsResizeToRemove.push(moduleId)
				}
				const moduleInstance = this.currentModules[moduleId]
				moduleInstance.mDestroy()
				moduleInstance.destroy()
				delete this.currentModules[moduleId]
			})
		})
		// }
		this.resizeModules = this.resizeModules.filter(
			(id) => !idsResizeToRemove.includes(id),
		)
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
				moduleInstance.mount()
			})

			Object.entries(this.currentModules).forEach(([, moduleInstance]) => {
				moduleInstance.update()
			})

			Object.assign(this.currentModules, this.newModules)
			this.newModules = {}
			// If there are modules that need to be resized, add the resize event listener. Otherwise, remove it to optimize performance.
			if (this.resizeModules.length > 0 && !this.resizing) {
				window.addEventListener("resize", this.resizeHandler)
				this.resizing = true
			} else {
				this.resizing = false
				window.removeEventListener("resize", this.resizeHandler)
			}

			if (this.resizing) {
				this.resize()
			}

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
	): Promise<any | null | Array<any>> {
		// Call function on the manager if moduleType is "app"
		if (moduleType === "app") {
			this.callApp(func, args)
		}
		// Call function on the module instance(s)
		if (moduleId) {
			return this.callSingle(func, args, moduleType, moduleId)
		}
		return this.callMultiple(func, args, moduleType)
	}

	/**
	 * @description Call a function on the modular instance or plugins.
	 * @param func string containing the name of the function to call on the modular instance or plugins.
	 * @param args any containing the arguments to pass to the function when calling it on the modular instance or plugins.
	 * @returns Promise that resolves with the result of the function call on the modular instance or plugins.
	 */
	callApp(func: string, args: any): Promise<any | null> {
		if (typeof this[func] !== "function") {
			console.warn(`Function ${func} does not exist on modular`)
			return Promise.resolve(null)
		}
		return this[func](args)
	}

	/**
	 * @description Call a function on a specific module instance.
	 * @param {string} func the name of the function to call on the module instance.
	 * @param {any} args  arguments to pass
	 * @param {string} moduleType name of the module type on which to call the function.
	 * @param {string} moduleId name of the module id
	 * @returns {Promise} Promise that resolves with the result of the function call on the module instance, or null if no instance or function is found.
	 */
	callSingle(
		func: string,
		args: any,
		moduleType: string,
		moduleId: string,
	): Promise<any | null> {
		const moduleInstance = this.currentModules[moduleId]
		if (!moduleInstance || typeof moduleInstance[func] !== "function") {
			console.warn(
				`No module instance found for module type ${moduleType} with id ${moduleId} or function ${func} does not exist`,
			)
			return Promise.resolve(null)
		}
		return moduleInstance[func](args)
	}

	/**
	 * @description Call a function on all module instances.
	 * @param {string} func the name of the function to call on the module instance.
	 * @param {any} args  arguments to pass
	 * @param {string} moduleType name of the module type on which to call the function.
	 * @returns {Promise} Promise that resolves with the result of the function call on the module instance, or null if no instance or function is found.
	 */
	callMultiple(
		func: string,
		args: any,
		moduleType: string,
	): Promise<Array<any> | null> {
		const modulesInstances = Object.values(this.currentModules).filter(
			(moduleInstance) => moduleInstance.constructor.name === moduleType,
		)
		if (
			modulesInstances.length === 0 ||
			typeof modulesInstances[0][func] !== "function"
		) {
			console.warn(
				`No module instances found for module type ${moduleType} or function ${func} does not exist on these instances`,
			)
			return new Promise((resolve) => resolve(null))
		}
		const promises: Array<Promise<any>> = []
		modulesInstances.forEach((moduleInstance) => {
			promises.push(moduleInstance[func](args))
		})
		return Promise.all(promises)
	}

	/**
	 * @description Handle the intersection of observed to observe modules enter and leave the viewport.
	 * @param entries Array of IntersectionObserverEntry objects representing the observed modules that have intersected with the viewport.
	 * @returns void
	 */
	handleIntersect(entries: IntersectionObserverEntry[]) {
		entries.forEach((entry) => {
			this.modules.forEach((moduleItem) => {
				if (!entry.target.hasAttribute(`data-module-${moduleItem.name}`)) {
					return
				}
				const moduleId = entry.target.getAttribute(
					`data-module-${moduleItem.name}`,
				) as string
				const moduleInstance = this.currentModules[moduleId]
				moduleInstance.toggleView(entry.isIntersecting)
				if (entry.isIntersecting && !moduleItem.repeat) {
					this.observer.unobserve(entry.target)
				}
			})
		})
	}

	/**
	 * @description Call the resize method on all modules that have registered for resize events. This method is debounced to prevent excessive calls during window resizing.
	 * @returns void
	 */
	resize(): void {
		this.resizeModules.forEach((moduleId) => {
			const moduleInstance = this.currentModules[moduleId]
			moduleInstance.resize()
		})
	}
}
