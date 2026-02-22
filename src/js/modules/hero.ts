import Mmodule from "@js/classes/module"
import { isReduced, isMobile } from "@js/utils/tools"
import { animateCss, type CancelledPromise } from "@js/utils/animations"

export default class HeroTitle extends Mmodule {
	private promise: CancelledPromise<void> | null
	constructor(params: any) {
		super(params)
		this.promise = null
		this.busMap = {
			"website:loaded": "onLoaded",
		}
		this.timeout = null
	}

	onMount() {
		if (isReduced() || isMobile()) {
			return
		}

		const parent = this.el.parentNode as HTMLElement
		this.animate("enterFirst", () => {
			parent.classList.add("-animating")
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
			data.push({
				el: letter,
				transform: `translate(${-offsetX}px, ${-offsetY}px)`,
			})
		})

		const parent = this.el.parentNode as HTMLElement
		const firstAnimation = animateCss({
			name: `letterHero:enter`,
			parent: this.el,
			handler: () => {
				data.forEach(({ el, transform }) => {
					el.style.transform = transform
				})
			},
		})
		this.promise = firstAnimation
		firstAnimation.then(() => {
			const secondAnimation = animateCss({
				name: `introHero:enter`,
				parent: parent,
				handler: () => {
					parent.classList.add("-entered")
				},
			})
			this.promise = secondAnimation
			secondAnimation.then(() => {
				this.animate("enter", () => {
					parent.classList.remove("-animating")
					parent.classList.remove("-entered")
				})
			})
		})
	}

	onUnMount(): void {
		this.emit("plugins:animations:remove", `${this.moduleKey}:enterFirst`)
		this.emit("plugins:animations:remove", `${this.moduleKey}:enter`)
		if (this.timeout) {
			clearTimeout(this.timeout)
		}
		this.promise?.cancel()
	}
}
