import ModularPlugin, {
	type ModulePluginInit,
} from "@js/classes/modular-plugin"
import type Mmodule from "@js/classes/module"

export interface ResizableModule extends Mmodule {
	updateView: (state: boolean) => void
	onUpdateView: (state: boolean) => void
}

export default class ObserverPlugin extends ModularPlugin {
	public name: string = "observer"
	protected observer: IntersectionObserver
	protected elements: Map<Element, string>
	constructor(m: ModulePluginInit) {
		super(m)
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
		this.busMap = {
			"plugins:observer:on": "observe",
			"plugins:observer:off": "unobserve",
		}
	}

	observe({ el, key, once }: { el: HTMLElement; key: string; once?: boolean }) {
		this.observer.observe(el)
		this.elements.set(el, key)
		if (once) {
			this.once.add(key)
		}
	}

	unobserve(el: HTMLElement) {
		if (!this.elements.has(el) || !el) return
		this.observer.unobserve(el)
		this.elements.delete(el)
		this.once.delete(el)
	}

	handleIntersect(
		entries: IntersectionObserverEntry[],
		observer: IntersectionObserver,
	) {
		entries.forEach((entry) => {
			if (!this.elements.has(entry.target)) return
			const key = this.elements.get(entry.target)
			// if (el === entry.target) {
			this.bus.emit(`call:${key}`, {
				method: "updateView",
				payload: entry.isIntersecting,
			})
			if (entry.isIntersecting && this.once.has(key)) {
				console.log(`Unobserving ${key} after first intersection`)
				observer.unobserve(entry.target)
				this.elements.delete(entry.target)
				this.once.delete(key)
			}
			// this.elements.forEach((el, key) => {
			// 	// }
			// })
		})
	}
}
