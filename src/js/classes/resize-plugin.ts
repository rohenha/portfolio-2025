import { debounce } from "@js/utils/tools"
import ModularPlugin, {
	type ModulePluginInit,
} from "@js/classes/modular-plugin"
import type Mmodule from "@js/classes/module"

export interface ResizableModule extends Mmodule {
	onResize: () => void
}

export default class ResizePlugin extends ModularPlugin {
	public name: string = "resize"
	protected debounceResize: () => void
	constructor(m: ModulePluginInit) {
		super(m)
		this.debounceResize = debounce(this.resize.bind(this), 450)
	}

	onMount(): void {
		window.addEventListener("resize", this.debounceResize)
	}

	unmount(): void {
		window.removeEventListener("resize", this.debounceResize)
		super.unmount()
	}

	resize() {
		this.bus.emit("plugins:resizer:resize")
	}
}
