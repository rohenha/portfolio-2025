import Mmodule from "@js/classes/module"

export default class Hidden extends Mmodule {
	constructor(params: any) {
		super(params)
		this.index = 0
		this.busMap = {
			"experience:loop": "resetExperience",
			"call:initHidden": "initHidden",
			"call:resetHidden": "resetExperience",
		}
		this.active = false
	}

	onMount() {
		this.observe(true)
	}

	initHidden() {
		if (this.active) return
		this.active = true
		this.animate("morse", () => {
			this.el.classList.add("-active")
		})
	}

	onUpdateView(state: boolean) {
		if (!state) {
			this.resetExperience()
			return
		}

		if (this.active) {
			this.index = 0
			this.initHidden()
		}
	}

	updateMorse() {}

	resetExperience() {
		if (!this.active) return
		this.active = false
		this.animate("morse", () => {
			this.el.classList.remove("-active")
		})
	}

	/**
	 * @description Clean up the experience module and events
	 */
	onUnMount(): void {
		this.observe(false)
	}
}
