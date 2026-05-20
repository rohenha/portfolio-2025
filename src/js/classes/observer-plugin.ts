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
	protected once: Set<string>
	constructor(m: ModulePluginInit) {
		super(m)
		this.elements = new Map()
		this.once = new Set()
		this.observer = new IntersectionObserver(this.handleIntersect.bind(this), {
			root: null,
			rootMargin: "0px",
			threshold: 0,
			...(m.params || {}),
		})
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
		const key = this.elements.get(el)!
		this.elements.delete(el)
		this.once.delete(key)
	}

	handleIntersect(
		entries: IntersectionObserverEntry[],
		observer: IntersectionObserver,
	) {
		entries.forEach((entry) => {
			if (!this.elements.has(entry.target)) return
			const key = this.elements.get(entry.target)!
			this.bus.emit(`call:${key}`, {
				method: "updateView",
				payload: entry.isIntersecting,
			})
			if (entry.isIntersecting && this.once.has(key)) {
				observer.unobserve(entry.target)
				this.elements.delete(entry.target)
				this.once.delete(key)
			}
		})
	}
}
