import ModularPlugin, {
	type ModulePluginInit,
} from "@js/classes/modular-plugin"

export interface Animation {
	animate: () => void
	keep?: boolean
}

export default class AnimationsPlugin extends ModularPlugin {
	protected animations: Map<string, Animation>
	protected requestId: number | undefined
	constructor(m: ModulePluginInit) {
		super(m)
		this.name = "animations"
		this.animations = new Map()
		this.requestId = undefined
		this.render = this.render.bind(this)
		this.busMap = {
			"plugins:animations:add": "add",
			"plugins:animations:remove": "remove",
		}
	}

	add({ name, animation }: { name: string; animation: Animation }) {
		this.animations.set(name, animation)
		if (!this.requestId) {
			this.requestId = window.requestAnimationFrame(this.render)
		}
	}

	remove(name: string) {
		this.animations.delete(name)
	}

	render() {
		this.animate()
		if (this.animations.size > 0) {
			this.requestId = window.requestAnimationFrame(this.render)
		} else {
			this.requestId = undefined
		}
	}

	animate(): void {
		const toDelete: string[] = []
		this.animations.forEach((item, id) => {
			item.animate()
			if (!item.keep) {
				toDelete.push(id)
			}
		})
		toDelete.forEach((id) => {
			this.animations.delete(id)
		})
	}
}
