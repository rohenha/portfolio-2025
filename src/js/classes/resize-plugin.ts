import { debounce } from "@js/utils/tools"
import ModularPlugin, {
	type ModulePluginInit,
} from "@js/classes/modular-plugin"

export default class ResizePlugin extends ModularPlugin {
	public name: string = "resize"
	protected debounceResize: () => void
	constructor(m: ModulePluginInit) {
		super(m)

		this.debounceResize = debounce(this.resize.bind(this), 450)
		window.addEventListener("resize", this.debounceResize)
	}

	resize() {
		this.bus.emit("plugins:resizer:resize")
		window.requestAnimationFrame(() => {
			this.bus.emit("plugins:resizer:render")
		})
	}
}
