import Mmodule, { type ModuleConstructorParams } from "@js/classes/module"

export default class Hidden extends Mmodule {
	protected busMap = {
		"experience:loop": "resetExperience",
		"call:initHidden": "initHidden",
		"call:resetHidden": "resetExperience",
	}

	private active: boolean = false

	constructor(params: ModuleConstructorParams) {
		super(params)
	}

	onMount() {
		this.observe(true)
	}

	initHidden() {
		if (this.active) return
		this.active = true
		this.animate("hidden", () => {
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
		this.animate("hidden", () => {
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
