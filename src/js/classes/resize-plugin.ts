import ModularPlugin, {
	type ModularPluginMethod,
} from "@js/classes/modular-plugin"
import { debounce } from "@js/utils/tools"

declare module "@js/classes/modular" {
	interface ModuleConfig {
		resize?: boolean
	}
}

export default class ResizePlugin extends ModularPlugin {
	protected resizing: boolean
	protected resizeModules: Array<string>
	protected idsResizeToRemove: Array<string>
	protected debouneRemoveIds: () => void
	protected debounceResize: () => void
	constructor() {
		super()
		this.resizing = false
		this.resizeModules = []
		this.idsResizeToRemove = []

		this.debouneRemoveIds = debounce(this.removeIds.bind(this), 1000)
		this.debounceResize = debounce(this.resize.bind(this), 450)
	}

	resize() {
		const currentModules = this.getModules()
		this.resizeModules.forEach((moduleId) => {
			const moduleInstance = currentModules[moduleId]
			moduleInstance.onResize()
		})
	}

	removeIds() {
		if (this.idsResizeToRemove.length > 0) {
			this.resizeModules = this.resizeModules.filter(
				(moduleId) => !this.idsResizeToRemove.includes(moduleId),
			)
			this.idsResizeToRemove = []
		}
	}

	onModuleMount({ instance, config }: ModularPluginMethod): void {
		if (config.resize) {
			this.resizeModules.push(instance.id)
		}
	}

	onModuleUnMount({ instance }: ModularPluginMethod): void {
		const { id } = instance
		if (this.resizeModules.includes(id)) {
			this.idsResizeToRemove.push(id)
		}
		this.debouneRemoveIds()
	}

	onUpdate(): void {
		if (this.resizeModules.length > 0 && !this.resizing) {
			window.addEventListener("resize", this.debounceResize)
			this.resizing = true
		} else {
			this.resizing = false
			window.removeEventListener("resize", this.debounceResize)
		}

		if (this.resizing) {
			this.resize()
		}
	}
}
