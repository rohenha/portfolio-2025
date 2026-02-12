import ModularPlugin, {
	type ModularPluginMethod,
} from "@js/classes/modular-plugin"

declare module "@js/classes/modular" {
	interface ModuleConfig {
		observe?: boolean
		repeat?: boolean
	}
}

export default class ObserverPlugin extends ModularPlugin {
	protected observer: IntersectionObserver

	constructor({ observerOptions }: { observerOptions?: {} } = {}) {
		super()
		this.name = "observer"
		this.observer = new IntersectionObserver(
			this.handleIntersect.bind(this),
			Object.assign(observerOptions || {}, {
				root: null,
				rootMargin: "0px",
				threshold: 0.1,
			}),
		)
	}

	handleIntersect(
		entries: IntersectionObserverEntry[],
		observer: IntersectionObserver,
	) {
		const currentModules = this.getModules()
		const configs = this.getConfigs()
		entries.forEach((entry) => {
			Object.keys(currentModules).forEach((moduleId) => {
				const moduleItem = currentModules[moduleId]
				if (!entry.target.hasAttribute(`data-module-${moduleItem.dataName}`)) {
					return
				}
				const moduleInstance = currentModules[moduleId]
				moduleInstance.updateView(entry.isIntersecting)
				const config = configs.find((c) => c.name === moduleInstance.dataName)
				if (config) {
					if (entry.isIntersecting && !config.repeat) {
						observer.unobserve(entry.target)
					}
				}
			})
		})
	}

	onModuleMount({ instance, config }: ModularPluginMethod): void {
		const { el } = instance
		if (config.observe) {
			this.observer.observe(el)
		}
	}

	onModuleUnMount({ instance }: ModularPluginMethod): void {
		const { el } = instance
		this.observer.unobserve(el)
	}
}
