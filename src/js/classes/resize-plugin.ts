import { debounce } from "@js/utils/tools"
import ModularPlugin, {
	// type ModularPluginMethod,
	type ModulePluginInit,
} from "@js/classes/modular-plugin"

declare module "@js/classes/modular" {
	interface ModuleConfig {
		resize?: boolean
	}
}

export default class ResizePlugin extends ModularPlugin {
	protected debounceResize: () => void
	constructor(m: ModulePluginInit) {
		super(m)
		this.name = "resize"

		this.debounceResize = debounce(this.resize.bind(this), 450)
		window.addEventListener("resize", this.debounceResize)
	}

	resize() {
		this.bus.emit("resizer:resize")
	}
}
