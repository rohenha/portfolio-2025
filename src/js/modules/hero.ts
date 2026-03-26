import Mmodule from "@js/classes/module"
import { isReduced, isMobile } from "@js/utils/tools"

export default class HeroTitle extends Mmodule {
	constructor(params: any) {
		super(params)
		this.busMap = {
			"website:loaded": "onLoaded",
		}
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
