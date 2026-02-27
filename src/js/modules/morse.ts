import Mmodule from "@js/classes/module"

export default class Morse extends Mmodule {
	constructor(params: any) {
		super(params)
		this.index = 0
		this.busMap = {
			"experience:loop": "resetExperience",
			"call:initMorse": "initMorse",
		}
		this.active = false
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

	increaseMorse() {
		if (!this.visible) return
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
		clearInterval(this.timeout!)
		this.observe(false)
		window.removeEventListener("beforeunload", this.onBeforeUnload)
		window.removeEventListener("visibilitychange", this.onChangeVisibility)
	}
}
