import Mmodule, { type ModuleConstructorParams } from "@js/classes/module"

export default class Morse extends Mmodule {
	protected busMap = {
		"experience:loop": "resetExperience",
		"call:initMorse": "initMorse",
		"call:resetMorse": "resetExperience",
	}

	private active: boolean = false

	constructor(params: ModuleConstructorParams) {
		super(params)
	}

	onMount() {
		this.observe(true)
	}

	initMorse() {
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
			this.initMorse()
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
