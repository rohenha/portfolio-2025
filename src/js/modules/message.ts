import Mmodule, { type ModuleConstructorParams } from "@js/classes/module"

export default class Message extends Mmodule {
	protected busMap = {
		"experience:loop": "resetExperience",
		"website:loaded": "startMessage",
	}

	private onReset: boolean = true
	private timeout: ReturnType<typeof setTimeout> | null = null

	constructor(params: ModuleConstructorParams) {
		super(params)
		this.visible = true
		this.active = false
	}

	onMount() {
		const [close] = this.$("close")
		close.addEventListener("click", this.onCloseClick.bind(this))
	}

	onCloseClick() {
		this.animate("message", () => {
			this.el.classList.remove("-active")
			if (this.timeout !== null) {
				clearTimeout(this.timeout)
			}
			this.timeout = setTimeout(() => {
				this.animate("message", () => {
					this.el.classList.remove("-visible")
				})
			}, 300)
		})
	}

	startMessage() {
		if (!this.onReset) {
			return
		}
		this.onReset = false
		const [data] = this.emit("call:experience:experience", {
			method: "getExperienceStatus",
		})
		if (data.loop <= 2 || data.finished || data.loop >= 4) {
			// if (data.loop <= 2 || data.loop >= 4) {
			return
		}
		if (this.timeout !== null) {
			clearTimeout(this.timeout)
		}
		this.timeout = setTimeout(() => {
			this.animate("message", () => {
				this.el.classList.add("-visible")
				this.animate("message", () => {
					this.el.classList.add("-active")
				})
			})
		}, 2000)
	}

	resetExperience() {
		this.onReset = true
		this.animate("message", () => {
			this.el.classList.remove("-visible")
			this.el.classList.remove("-active")
		})
	}

	/**
	 * @description Clean up the experience module and events
	 */
	onUnMount(): void {
		// this.observe(false)
	}
}
