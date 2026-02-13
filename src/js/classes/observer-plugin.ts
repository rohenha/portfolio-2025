import ModularPlugin, {
	// type ModularPluginMethod,
	type ModulePluginInit,
} from "@js/classes/modular-plugin"

declare module "@js/classes/modular" {
	interface ModuleConfig {
		observe?: boolean
		repeat?: boolean
	}
}

export default class ObserverPlugin extends ModularPlugin {
	protected observer: IntersectionObserver
	protected elements: Map<string, Element>
	// constructor({ observerOptions }: { observerOptions?: {} } = {}) {
	// 	super()
	constructor(m: ModulePluginInit) {
		super(m)
		this.name = "observer"
		this.elements = new Map()
		this.once = new Set()
		this.observer = new IntersectionObserver(
			this.handleIntersect.bind(this),
			Object.assign(m.params || {}, {
				root: null,
				rootMargin: "0px",
				threshold: 0.1,
			}),
		)
		this.bus.on("observer:on", this.observe.bind(this))
		this.bus.on("observer:once", this.observeOnce.bind(this))
		this.bus.on("observer:off", this.unobserve.bind(this))
	}

	observe({ el, key }: { el: HTMLElement; key: string }) {
		this.observer.observe(el)
		this.elements.set(key, el)
	}

	observeOnce({ el, key }: { el: HTMLElement; key: string }) {
		this.observer.observe(el)
		this.elements.set(key, el)
		this.once.add(key)
	}

	unobserve(key: string) {
		this.observer.unobserve(this.elements.get(key)!)
		this.elements.delete(key)
		this.once.delete(key)
	}

	handleIntersect(
		entries: IntersectionObserverEntry[],
		observer: IntersectionObserver,
	) {
		entries.forEach((entry) => {
			this.elements.forEach((el, key) => {
				if (el === entry.target) {
					this.bus.emit(`call:${key}`, {
						method: "onUpdateView",
						payload: entry.isIntersecting,
					})
					if (entry.isIntersecting && this.once.has(key)) {
						console.log(`Unobserving ${key} after first intersection`)
						observer.unobserve(el)
						this.elements.delete(key)
						this.once.delete(key)
					}
				}
			})
		})
	}
}
