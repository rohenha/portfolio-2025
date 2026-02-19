import Mmodule from "@js/classes/module"
import { isReduced, isMobile } from "@js/utils/tools"

export default class HeroTitle extends Mmodule {
	constructor(params: any) {
		super(params)
		this.busMap = {
			"website:loaded": "onLoaded",
		}
		this.timeout = null

		console.log(isReduced(), isMobile(), "test")
		if (isReduced() || isMobile()) {
			return
		}

		console.log("test")
		const parent = this.el.parentNode as HTMLElement
		this.emit("plugins:animations:add", {
			name: `${this.moduleKey}:enter`,
			animation: {
				animate: () => {
					parent.classList.add("-animating")
				},
				keep: false,
			},
		})
	}

	onLoaded() {
		if (isReduced() || isMobile()) {
			return
		}

		const letters = this.$("letter") as HTMLElement[]
		const words = this.$("word") as HTMLElement[]
		const data: Array<{ el: HTMLElement; transform: string }> = []
		letters.forEach((letter, i) => {
			const letterRect = letter.getBoundingClientRect()
			const word = words[i]
			const wordRect = word.getBoundingClientRect()
			const offsetX = letterRect.left - wordRect.left
			const offsetY = letterRect.top - wordRect.top
			console.log(letterRect.top, wordRect.top)
			data.push({
				el: letter,
				transform: `translate(${-offsetX}px, ${-offsetY}px)`,
			})
		})

		this.emit("plugins:animations:add", {
			name: `${this.moduleKey}:enter`,
			animation: {
				animate: () => {
					data.forEach(({ el, transform }) => {
						el.style.transform = transform
					})
				},
				keep: false,
			},
		})

		const parent = this.el.parentNode as HTMLElement
		this.timeout = setTimeout(() => {
			this.emit("plugins:animations:add", {
				name: `${this.moduleKey}:enter`,
				animation: {
					animate: () => {
						parent.classList.add("-entered")
						this.timeout = setTimeout(() => {
							this.emit("plugins:animations:add", {
								name: `${this.moduleKey}:enter`,
								animation: {
									animate: () => {
										parent.classList.remove("-animating")
										parent.classList.remove("-entered")
									},
									keep: false,
								},
							})
						}, 1600)
					},
					keep: false,
				},
			})
		}, 1600)
	}

	onUnMount(): void {
		if (this.timeout) {
			clearTimeout(this.timeout)
		}
		this.emit("plugins:animations:remove", `${this.moduleKey}:enter`)
	}
}
