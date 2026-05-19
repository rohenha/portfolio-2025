import Mmodule, { type ModuleConstructorParams } from "@js/classes/module"
import { isReduced, isMobile } from "@js/utils/tools"

export default class HeroTitle extends Mmodule {
	protected busMap = {
		"website:loaded": "onLoaded",
	}

	constructor(params: ModuleConstructorParams) {
		super(params)
	}

	onLoaded() {
		if (isReduced() || isMobile()) {
			return
		}

		const parent = this.el.parentNode?.parentNode as HTMLElement
		this.animate("enterFirst", () => {
			parent.classList.add("-animating")
		})
	}
}
