import ModularPlugin, {
	type ModulePluginInit,
} from "@js/classes/modular-plugin"

export interface Animation {
	calculate?: () => any
	animate?: (args?: any) => void
	keep?: boolean
	calculated?: any
}

export default class ObserverPlugin extends ModularPlugin {
	protected animations: Map<string, Animation>
	protected animating: boolean
	protected force: boolean
	protected delayStart: ReturnType<typeof setTimeout> | undefined | number
	protected requestId: number | undefined
	constructor(m: ModulePluginInit) {
		super(m)
		this.name = "animations"
		this.animations = new Map()
		this.animating = false
		this.force = false
		this.delayStart = undefined
		this.render = this.render.bind(this)
		this.requestId = undefined

		this.bus.on("plugins:animations:add", this.add.bind(this))
		this.bus.on("plugins:animations:remove", this.remove.bind(this))
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
		if (this.animating || this.force) {
			this.force = false
			this.requestId = window.requestAnimationFrame(this.render)
		}
	}

	animate(): void {
		const toDelete: string[] = []
		this.animations.forEach((item) => {
			if (item.calculate) {
				item.calculated = item.calculate()
			}
		})
		this.animations.forEach((item, id) => {
			if (item.animate) {
				item.animate(item.calculated || null)
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
