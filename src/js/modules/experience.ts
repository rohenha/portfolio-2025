import Mmodule, { type ModuleConstructorParams } from "@js/classes/module"
import { getCookie, setCookie } from "@js/utils/cookies"
import { animateCss } from "@js/utils/animations"
import { isMobile } from "@js/utils/tools"

export default class Experience extends Mmodule {
	protected busMap = {
		toggleExperience: "toggleExperience",
		"website:loaded": "onWebsiteLoaded",
	}

	private interval: ReturnType<typeof setInterval> | null = null
	private readonly defaultTimer: number = 60 * 5
	private circleLength: number = 33
	private experience: { finished: boolean; loop: number } = {
		finished: false,
		loop: 1,
	}
	private backInTime: HTMLElement | null = null
	private comment: CharacterData | null = null
	private combination: string[] = []
	private static readonly COMBO_HASH =
		"d8af3f34b00d55d5ec600bc30e67f2480994da87cd7ea52c9325697701257e50"
	private static readonly COMBO_LENGTH = 9
	private static readonly TIMELINE = new Map<number, string>([
		[250, "call:initTree"],
		[230, "initHidden"],
		[150, "initMorse"],
		[100, "call:resetTree"],
		[90, "addLog"],
		[60, "addComment"],
		[50, "resetHidden"],
		[10, "resetMorse"],
		[5, "removeComment"],
	])

	private readonly onUpdateTime: () => void
	private readonly onBeforeUnload: () => void
	private readonly onChangeVisibility: () => void
	private readonly onKeyDown: (e: KeyboardEvent) => void

	constructor(params: ModuleConstructorParams) {
		super(params)
		this.states = { number: this.defaultTimer }
		this.visible = true
		this.onUpdateTime = this._updateTime.bind(this)
		this.onBeforeUnload = this._beforeUnload.bind(this)
		this.onChangeVisibility = this._changeVisibility.bind(this)
		this.onKeyDown = this._keyDown.bind(this)
	}

	getExperienceStatus(): { finished: boolean; loop: number } {
		return this.experience
	}

	/**
	 * @description Hash a string using SHA-256 via the Web Crypto API
	 */
	private async hashCombo(input: string): Promise<string> {
		const data = new TextEncoder().encode(input)
		const buffer = await crypto.subtle.digest("SHA-256", data)
		return Array.from(new Uint8Array(buffer))
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("")
	}

	/**
	 * @description Listen for keydown events. It check user combination to finish the experience when the user enter the good combination.
	 */
	private async _keyDown(e: KeyboardEvent) {
		this.combination.push(e.key)
		// Keep only the last N keys (combo length)
		if (this.combination.length > Experience.COMBO_LENGTH) {
			this.combination.shift()
		}

		// Only check when we have enough keys
		if (this.combination.length === Experience.COMBO_LENGTH) {
			const hash = await this.hashCombo(this.combination.join(","))
			if (hash === Experience.COMBO_HASH) {
				this.finishExperience()
				this.combination = []
			}
		}
	}

	/**
	 * @description Save the experience state in a cookie when the user leaves the page
	 */
	private _beforeUnload() {
		setCookie("experience", JSON.stringify(this.experience), 365)
	}

	/**
	 * @description Toggle the experience timer based on the page visibility to pause the timer when the user is not actively viewing the page
	 */
	private _changeVisibility() {
		this.toggleExperience({ enable: document.visibilityState === "visible" })
	}

	/**
	 * @description Initialize the experience state from a cookie and set up the timer if the experience is not finished
	 */
	async onMount() {
		const cookieValue = getCookie("experience")

		const parent = this.el.parentNode as HTMLElement
		const html = document.documentElement
		this.animate("initExperienceStyle", () => {
			html.classList.add("-experience")
		})
		if (!cookieValue) {
			this.addListeners()
			setCookie("experience", JSON.stringify({ finished: false, loop: 1 }), 365)
			this.toggleExperience({ enable: true })
			this.setIntroPopin()
		} else {
			this.experience = JSON.parse(cookieValue)
			if (!this.experience.finished) {
				this.animate("initExperience", () => {
					parent.style.display = "block"
				})
				this.addListeners()
				this.setIntroPopin()

				// this.emit("experience:loop", { loop: this.experience.loop })

				this.toggleExperience({ enable: true })
			} else {
				this.off(`toggleExperience:${this.moduleKey}`)
			}
		}
	}

	setIntroPopin(): void {
		setTimeout(() => {
			this.emit("open:popin-intro:popinIntro", {})
		}, 3000)
	}

	/**
	 * @description Add event listeners for beforeunload, visibilitychange, and keydown events to manage the experience state and user interactions effectively
	 */
	addListeners() {
		window.addEventListener("beforeunload", this.onBeforeUnload)
		window.addEventListener("visibilitychange", this.onChangeVisibility)
		window.addEventListener("keydown", this.onKeyDown)
	}

	/**
	 * @description Remove event listeners when the experience is finished or when the user leaves the page to prevent memory leaks and unintended behavior
	 */
	removeListeners() {
		window.removeEventListener("beforeunload", this.onBeforeUnload)
		window.removeEventListener("visibilitychange", this.onChangeVisibility)
		window.removeEventListener("keydown", this.onKeyDown)
	}

	/**
	 * @description disable experience when the user finishes the experience with the good combination
	 */
	finishExperience() {
		this.experience.finished = true
		this._beforeUnload()
		this.removeListeners()
		this.emit("experience:loop", { loop: this.experience.loop })
		const parent = this.el.parentNode as HTMLElement
		this.animate("finish", () => {
			parent.style.display = "none"
			this.setFinishPopin()
		})
	}

	/**
	 * @description Method to set the finish popin by emitting an event to add a new module instance of the popin module and open it once it's loaded
	 */
	async setFinishPopin() {
		document.body.setAttribute(
			"data-module-popin-finish",
			"experience-finish-popin",
		)
		const results = await this.emitAsync("app:addModules", [
			{
				name: "popin-finish",
				loader: () => import("./popin-finish"),
			},
		])
		const popin = results?.[0]?.[0]
		if (popin && typeof popin.open === "function") {
			popin.open()
		}
	}

	onWebsiteLoaded() {
		if (!this.backInTime) {
			return
		}
		const backInTime = this.backInTime
		this.backInTime = null
		const promiseThen = animateCss({
			name: "backInTime",
			parent: backInTime,
			handler: () => {
				backInTime.classList.add("-leave")
			},
		})
		promiseThen.then(() => {
			document.body.removeChild(backInTime)
		})
	}

	/**
	 * @description Toggle the experience timer based on the enable parameter, starting or stopping the timer accordingly
	 */
	toggleExperience({ enable }: { enable: boolean }) {
		this.animate("toggle", () => {
			document.body.classList.toggle("-experience", enable)
		})
		if (this.experience.finished || (enable && this.interval) || isMobile()) {
			this.setEvents({ time: this.states.number, start: true })
			return
		}
		if (enable) {
			this.interval = setInterval(this.onUpdateTime, 1000)
			this.setEvents({ time: this.states.number, start: true })
		} else {
			clearInterval(this.interval!)
			this.interval = null
		}
	}

	/**
	 * @description Update the experience timer, decrementing the number and resetting it when it reaches zero for new loop
	 */
	private _updateTime() {
		const newNumber = this.states.number - 1
		if (this.states.number <= 0) {
			this.loop()
			return
		}
		this.setEvents({ time: newNumber })

		this.states.number = newNumber
	}

	setEvents({ time, start = false }: { time: number; start?: boolean }): void {
		if (start) {
			Experience.TIMELINE.forEach((eventName, timeValue) => {
				if (timeValue >= time) {
					if (eventName.startsWith("call")) {
						this.emit(eventName)
					} else {
						this[eventName]()
					}
				}
			})
			return
		}
		const eventName = Experience.TIMELINE.get(time)
		if (eventName) {
			if (eventName.startsWith("call")) {
				this.emit(eventName)
			} else {
				this[eventName]()
			}
		}
	}

	/**
	 * @description Reset the experience with a new loop
	 */
	loop() {
		this.states.number = this.defaultTimer
		this.experience.loop += 1
		const backInTime = document.createElement("div")
		this.backInTime = backInTime
		backInTime.classList.add("o-backInTime")
		backInTime.setAttribute("data-transition", "backInTime")
		document.body.appendChild(backInTime)
		window.requestAnimationFrame(() => {
			const promise = animateCss({
				name: "backInTime",
				parent: backInTime,
				handler: () => {
					backInTime.classList.add("-active")
				},
			})
			promise.then(() => {
				this.emit("experience:loop", { loop: this.experience.loop })
				this.emit("call:transition:transition", {
					method: "navigate",
					payload: "/",
				})
			})
		})
	}

	/**
	 * @description Event to target number value update and render the module with the new value.
	 */
	onWatch(): void {
		this.animate("experience", () => {
			this.render()
		})
	}

	/**
	 * @description Render the experience module by updating the strokeDashoffset of the circle element based on the current number value and circle length to visually represent the remaining time in the experience timer
	 */
	onRender() {
		this.el.style.strokeDashoffset = String(
			Math.round((this.circleLength * this.states.number) / this.defaultTimer),
		)
	}

	/**
	 * @description Clean up the experience module and events
	 */
	onUnMount(): void {
		clearInterval(this.interval!)
		this.observe(false)
		this.removeListeners()
	}

	////////// Events
	addLog() {
		console.log("3")
	}

	addComment() {
		const comment = document.createComment("6")
		this.comment = comment
		this.animate("comment", () => {
			document.documentElement.appendChild(comment)
		})
	}

	removeComment() {
		this.animate("comment", () => {
			this.comment?.remove()
			this.comment = null
		})
	}

	initMorse() {
		this.changeMorse(true)
	}

	resetMorse() {
		this.changeMorse(false)
	}

	changeMorse(state: boolean) {
		const [morse] = this.$("morse", document.documentElement)
		if (!morse) return
		this.animate("toggleMorse", () => {
			morse.classList.toggle("-active", state)
		})
	}

	initHidden() {
		this.changeHidden(true)
	}

	resetHidden() {
		this.changeHidden(false)
	}

	changeHidden(state: boolean) {
		const [hidden] = this.$("hidden", document.documentElement)
		if (!hidden) return
		this.animate("toggleHidden", () => {
			hidden.classList.toggle("-active", state)
		})
	}
}
