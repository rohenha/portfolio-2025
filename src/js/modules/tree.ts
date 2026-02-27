import Mmodule from "@js/classes/module"

export default class Tree extends Mmodule {
	private interval: ReturnType<typeof setInterval> | null
	private last: HTMLElement | null
	private originalText: string | null
	private state: boolean
	constructor(params: any) {
		super(params)
		this.busMap = {
			"experience:loop": "resetExperience",
			"call:initTree": "initTree",
		}
		this.states = {
			index: 0,
		}
		this.last = null
		this.active = false
		this.originalText = null
		this.interval = null
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
	}

	onRender() {
		if (!this.last || !this.originalText) return
		if (
			this.states.index === 0 ||
			this.states.index > this.originalText.length
		) {
			this.last.textContent = this.originalText
			return
		}
		let firstPart = this.originalText.substring(0, this.states.index - 1)
		let lastPart = this.originalText.substring(this.states.index)
		this.last.textContent = firstPart + "Y" + lastPart
	}

	toggleHover(state: boolean) {
		if (!this.active || this.state === state) return
		clearInterval(this.interval!)
		this.emit("plugins:animations:remove", `${this.moduleKey}.treeanim`)
		this.emit("plugins:animations:remove", `${this.moduleKey}.treehover`)
		this.state = state
		if (state) {
			this.interval = setInterval(() => {
				this.states.index =
					(this.states.index + 1) % (this.originalText!.length + 1)
			}, 200)
		} else {
			this.states.index = 0
		}
	}

	onWatch(): void {
		this.animate("treeanim", () => {
			this.render()
		})
	}

	onUnMount(): void {
		this.emit("plugins:animations:remove", `${this.moduleKey}.treeanim`)
		this.emit("plugins:animations:remove", `${this.moduleKey}.treehover`)
		this.last?.removeEventListener("mouseenter", this.onMouseEnter)
		this.last?.removeEventListener("mouseleave", this.onMouseLeave)
	}

	initTree() {
		if (this.active) return
		this.active = true
		this.animate("morse", () => {
			this.last?.classList.add("-active")
		})
	}

	resetExperience() {
		if (!this.active) return
		this.active = false
		clearInterval(this.interval!)
		console.log("reset experience")
		this.emit("plugins:animations:remove", `${this.moduleKey}.treeanim`)
		this.states.index = 0
		this.animate("tree", () => {
			this.last?.classList.remove("-active")
		})
	}
}
