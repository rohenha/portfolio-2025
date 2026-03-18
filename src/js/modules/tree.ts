import Mmodule from "@js/classes/module"

export default class Tree extends Mmodule {
	// private interval: ReturnType<typeof setInterval> | null
	private last: HTMLElement | null
	private originalText: string | null
	private state: boolean
	private then: number
	private index: number
	constructor(params: any) {
		super(params)
		this.busMap = {
			"experience:loop": "resetExperience",
			"call:initTree": "initTree",
			"call:resetTree": "resetExperience",
		}
		// this.states = {
		// 	index: 0,
		// }
		this.then = new Date().getTime()
		this.interval = 1000 / 10
		this.index = 0
		this.last = null
		this.active = false
		this.originalText = null
		this.visible = true
		this.state = false
		this.onMouseEnter = this.toggleHover.bind(this, true)
		this.onMouseLeave = this.toggleHover.bind(this, false)
	}

	onMount() {
		const items = this.el.querySelectorAll(".a-treeItem__content")
		this.last = items[items.length - 1] as HTMLElement
		this.originalText = this.last.textContent
		this.last.addEventListener("mouseenter", this.onMouseEnter)
		this.last.addEventListener("mouseleave", this.onMouseLeave)
		this.animate("treeInit", () => {
			this.last?.classList.add("-active")
		})
	}

	onRender() {
		const now = new Date().getTime()
		const delta = now - this.then
		if (!this.last || !this.originalText || delta < this.interval) return
		this.then = now - (delta % this.interval)
		this.index = (this.index + 1) % (this.originalText!.length + 1)

		if (this.index === 0 || this.index > this.originalText.length) {
			this.last.textContent = this.originalText
			return
		}
		let firstPart = this.originalText.substring(0, this.index - 1)
		let lastPart = this.originalText.substring(this.index)
		this.last.textContent = firstPart + "Y" + lastPart
	}

	toggleHover(state: boolean) {
		if (!this.active || this.state === state) return
		this.cleanAnimation("treeanim")
		this.cleanAnimation("treehover")
		this.state = state
		if (state) {
			this.then = new Date().getTime()
			this.animate(
				"treeanim",
				() => {
					this.render()
				},
				true,
			)
		} else {
			this.animate("treeAnim", () => {
				if (!this.last) {
					return
				}
				this.last.textContent = this.originalText
			})
		}
	}

	onUnMount(): void {
		this.cleanAnimation("treeanim")
		this.cleanAnimation("treehover")
		this.last?.removeEventListener("mouseenter", this.onMouseEnter)
		this.last?.removeEventListener("mouseleave", this.onMouseLeave)
	}

	initTree() {
		if (this.active) return
		this.active = true
		// this.animate("treeInit", () => {
		// 	this.last?.classList.add("-active")
		// })
	}

	resetExperience() {
		this.toggleHover(false)
		if (!this.active) return
		this.active = false
		// clearInterval(this.interval!)
		this.cleanAnimation("treeanim")
		this.states.index = 0
		// this.animate("treeInit", () => {
		// 	this.last?.classList.remove("-active")
		// })
	}
}
