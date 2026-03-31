import Mmodule from "@js/classes/module"
import { getCookie, setCookie } from "@js/utils/cookies"
import { animateCss } from "@js/utils/animations"
import { isMobile } from "@js/utils/tools"

export default class Experience extends Mmodule {
	private interval: ReturnType<typeof setInterval> | null
	private defaultTimer: number
	private circleLength: number
	private experience: { finished: boolean; loop: number }
	private backInTime: HTMLElement | null
	private comment: CharacterData | null
	private static readonly COMBO_HASH =
		"d7e9b6abf3c848b4a5b797b0fb64ba2bea63e6853464384d0ba83b9bc2f25dc4"
	private static readonly COMBO_LENGTH = 10
	constructor(params: any) {
		super(params)
		this.interval = null
		this.defaultTimer = 60 * 5 // 30 seconds for testing
		// this.defaultTimer = 60 * 5 // 5 minutes
		this.busMap = {
			toggleExperience: "toggleExperience",
			"website:loaded": "onWebsiteLoaded",
		}
		this.comment = null
		this.experience = { finished: false, loop: 1 }
		this.states = {
			number: this.defaultTimer,
		}
		this.backInTime = null
		this.circleLength = 33
		this.visible = true
		this.onUpdateTime = this.onUpdateTime.bind(this)
		this.combination = []
		this.onBeforeUnload = this.onBeforeUnload.bind(this)
		this.onChangeVisibility = this.onChangeVisibility.bind(this)
		this.onKeyDown = this.onKeyDown.bind(this)
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
	async onKeyDown(e: KeyboardEvent) {
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
	onBeforeUnload() {
		setCookie("experience", JSON.stringify(this.experience), 365)
	}

	/**
	 * @description Toggle the experience timer based on the page visibility to pause the timer when the user is not actively viewing the page
	 */
	onChangeVisibility() {
		this.toggleExperience({ enable: document.visibilityState === "visible" })
	}

	/**
	 * @description Initialize the experience state from a cookie and set up the timer if the experience is not finished
	 */
	onMount() {
		const cookieValue = getCookie("experience")
		if (isMobile()) {
			return
		}

		const parent = this.el.parentNode as HTMLElement
		if (!cookieValue) {
			this.addListeners()
			setCookie("experience", JSON.stringify({ finished: false, loop: 1 }), 365)
			this.animate("initExperience", () => {
				parent.style.display = "block"
			})
			this.setIntroPopin()
		} else {
			this.experience = JSON.parse(cookieValue)
			if (!this.experience.finished) {
				this.animate("initExperience", () => {
					parent.style.display = "block"
				})
				this.addListeners()
				if (this.experience.loop === 1) {
					this.setIntroPopin()
				}
			} else {
				this.off(`toggleExperience:${this.moduleKey}`)
			}
		}
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
		this.onBeforeUnload()
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
	async setIntroPopin() {
		console.log("setIntroPopin")
		document.body.setAttribute(
			"data-module-popin-intro",
			"experience-intro-popin",
		)
		const promise = await this.emitAsync("app:addModules", [
			{
				name: "popin-intro",
				loader: () => import("./popin-intro"),
			},
		])
		setTimeout(() => {
			promise[0][0].open()
		}, 3000)
	}

	/**
	 * @description Method to set the finish popin by emitting an event to add a new module instance of the popin module and open it once it's loaded
	 */
	async setFinishPopin() {
		document.body.setAttribute(
			"data-module-popin-finish",
			"experience-finish-popin",
		)
		const promise = await this.emitAsync("app:addModules", [
			{
				name: "popin-finish",
				loader: () => import("./popin-finish"),
			},
		])
		promise[0][0].open()
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
			return
		}
		if (enable) {
			this.interval = setInterval(this.onUpdateTime, 1000)
		} else {
			clearInterval(this.interval!)
			this.interval = null
		}
	}

	/**
	 * @description Update the experience timer, decrementing the number and resetting it when it reaches zero for new loop
	 */
	onUpdateTime() {
		const newNumber = this.states.number - 1
		const events = new Map([
			[250, "call:initTree"],
			[230, "initHidden"],
			[150, "call:initMorse:morse:morse"],
			// [25, "call:initNumber:background:bg"],
			[100, "call:resetTree"],
			[100, "addLog"],
			[60, "addComment"],
			[50, "resetHidden"],
			[10, "call:resetMorse:morse:morse"],
			[5, "removeComment"],
		])
		if (this.states.number <= 0) {
			this.loop()
			return
		}

		if (events.has(newNumber)) {
			const eventName = events.get(newNumber)!
			if (eventName.startsWith("call")) {
				this.emit(eventName)
			} else {
				this[eventName]()
			}
		}
		this.states.number = newNumber
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

	initHidden() {
		this.changeHidden(true)
	}

	resetHidden() {
		this.changeHidden(false)
	}

	changeHidden(state: boolean) {
		const [hidden] = this.$("hidden")
		if (!hidden) return
		this.animate("hidden", () => {
			hidden.classList.toggle("-active", state)
		})
	}
}
