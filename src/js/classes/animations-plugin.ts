import ModularPlugin, {
	type ModularPluginMethod,
} from "@js/classes/modular-plugin"

// declare module "@js/classes/modular" {
// 	interface ModuleConfig {
// 		observe?: boolean
// 		repeat?: boolean
// 	}
// }

export interface Animation {
	calculate?: () => any
	animate?: (args?: any) => void
	keep?: boolean
	dataCalculated?: any
}

export default class ObserverPlugin extends ModularPlugin {
	protected animations: Map<string, Animation>
	protected animating: boolean
	protected force: boolean
	protected delayStart: ReturnType<typeof setTimeout> | undefined | number
	protected requestId: number | undefined
	constructor() {
		super()
		this.name = "animations"
		this.animations = new Map()
		this.animating = false
		this.force = false
		this.delayStart = undefined
		this.render = this.render.bind(this)
		this.requestId = undefined
	}

	// onModuleMount({ instance, config }: ModularPluginMethod): void {}

	// onModuleUnMount({ instance }: ModularPluginMethod): void {}

	add({ name, animation }: { name: string; animation: Animation }) {
		if (this.animations.get(name)) {
			this.remove(name)
		}

		this.animations.set(name, animation)
		clearTimeout(this.delayStart)
		this.delayStart = window.setTimeout(() => {
			if (this.animating) {
				this.force = true
			} else {
				this.animating = true
				this.requestId = window.requestAnimationFrame(this.render)
			}
		}, 30)
	}

	remove(name: string) {
		this.animations.delete(name)
	}

	render() {
		// this.animate()
		this.animate()
		if (this.animating || this.force) {
			this.force = false
			this.requestId = window.requestAnimationFrame(this.render)
		}
	}

	animate(): void {
		const toDelete: string[] = []
		this.animations.forEach((item) => {
			if (item.calculate) {
				item.dataCalculated = item.calculate()
			}
		})
		this.animations.forEach((item, id) => {
			if (item.animate) {
				item.animate(item.dataCalculated || null)
			}
			if (!item.keep) {
				toDelete.push(id)
			}
		})

		toDelete.forEach((id) => {
			this.animations.delete(id)
		})
		this.animating = this.animations.size > 0
	}

	// aAnimate(): void {

	// }
}
