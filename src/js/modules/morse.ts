import Mmodule from "@js/classes/module"

export default class Morse extends Mmodule {
	private timeout: ReturnType<typeof setTimeout> | null
	private index: number
	private morse: string[]
	constructor(params: any) {
		super(params)
		this.index = 0
		this.busMap = {
			"experience:loop": "resetExperience",
			"call:initMorse": "initMorse",
		}
		this.morse = "- . . - ".split("")
		this.timeout = null
		this.active = false
	}

	onMount() {
		this.observe(true)
	}

	initMorse() {
		this.active = true
		this.increaseMorse()
	}

	increaseMorse() {
		if (!this.visible) return
		const { morse } = this
		const tag = morse[this.index]
		clearTimeout(this.timeout!)
		this.animate("morse", () => {
			this.el.textContent = tag
			let delay = tag === "-" ? 700 : 350
			if (tag === "") {
				delay = 200
			}
			if (this.index + 1 >= morse.length) {
				delay = 3000
			}
			this.timeout = setTimeout(() => {
				this.index = (this.index + 1) % morse.length
				this.increaseMorse()
			}, delay)
		})
	}

	onUpdateView(state: boolean) {
		if (!state) {
			this.resetExperience()
		} else {
			this.index = 0
			this.increaseMorse()
		}
	}

	updateMorse() {}

	resetExperience() {
		this.active = false
		clearTimeout(this.timeout!)
		this.animate("morse", () => {
			this.el.textContent = ""
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
