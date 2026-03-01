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
	constructor(params: any) {
		super(params)
		this.interval = null
		this.defaultTimer = 30 // 30 seconds for testing
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
	 * @description Listen for keydown events. It check user combination to finish the experience when the user enter the good combination.
	 */
	onKeyDown(e: KeyboardEvent) {
		const code = [
			"ArrowUp",
			"ArrowUp",
			"ArrowDown",
			"ArrowDown",
			"ArrowLeft",
			"ArrowRight",
			"ArrowLeft",
			"ArrowRight",
			"b",
			"a",
		]
		if (e.key === code[this.combination.length]) {
			this.combination.push(e.key)
			if (this.combination.length === code.length) {
				// console.log("Konami code entered!")
				this.finishExperience()
				this.combination = []
			}
		} else {
			this.combination = []
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

		if (!cookieValue) {
			this.observe(true)
			this.addListeners()
			setCookie("experience", JSON.stringify({ finished: false, loop: 1 }), 365)
		} else {
			this.experience = JSON.parse(cookieValue)
			if (!this.experience.finished) {
				this.observe(true)
				this.addListeners()
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
	async setFinishPopin() {
		document.body.setAttribute("data-module-popin", "experience-finish-popin")
		const promise = await this.emitAsync("app:addAloneModules", [
			{
				element: document.body,
				moduleItem: {
					name: "popin",
					loader: () => import("./popin"),
				},
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
			[28, "call:initTree"],
			[25, "call:initMorse:morse:morse"],
			[20, "addLog"],
			[15, "addComment"],
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
		this.emit("experience:loop", { loop: this.experience.loop })
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
				this.emit("call:website:website", {
					method: "navigate",
					payload: {
						url: "/",
					},
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
		console.log("T")
	}

	addComment() {
		const comment = document.createComment("J")
		this.comment = comment
		document.documentElement.appendChild(comment)
	}

	removeComment() {
		this.comment?.remove()
		this.comment = null
	}
}
