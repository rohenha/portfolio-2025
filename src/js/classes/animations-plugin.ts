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
	calculate?: () => void
	animate?: (args?: any) => void
	keep?: boolean
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
		this.animate()
		this.aAnimate()
		if (this.animating || this.force) {
			this.force = false
			this.requestId = window.requestAnimationFrame(this.render)
		}
	}

	animate(): void {
		this.animations.forEach((item) => {
			if (item.calculate) {
				item.calculate()
			}
		})
	}

	aAnimate(): void {
		const toDelete: string[] = []

		this.animations.forEach((item, id) => {
			if (item.animate) {
				item.animate()
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
}
