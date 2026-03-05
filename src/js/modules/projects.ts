import Mmodule from "@js/classes/module"
import { throttle } from "@js/utils/tools"
export default class Hidden extends Mmodule {
	constructor(params: any) {
		super(params)
		this.busMap = {
			"plugins:resizer:resize": "onResize",
		}
		this.range = [0, 0]
		this.index = 0
		this.active = false
		this.onScroll = throttle(this.onScroll.bind(this), 100)
	}

	onMount() {
		this.observe(true)
		window.addEventListener("scroll", this.onScroll)
		this.onResize()
		this.items = this.$("item", this.el.parentElement as HTMLElement)
	}

	onScroll() {
		if (!this.visible) return
		const progress = Math.min(
			Math.max(
				(window.scrollY - window.innerHeight * 0.25 - this.range[0]) /
					(this.range[1] - this.range[0]),
				0,
			),
			1,
		)
		const index = Math.floor(progress * (this.items.length - 1))
		if (index !== this.index) {
			this.index = index
			this.animate("projectsScroll", this.onRender.bind(this))
		}
	}

	onResize() {
		const bounding = this.el.getBoundingClientRect()
		this.range = [
			bounding.top +
				window.scrollY -
				window.innerHeight +
				window.innerHeight * 0.5,
			bounding.top + bounding.height + window.scrollY - window.innerHeight,
		]
	}

	onRender() {
		this.items.forEach((item: HTMLElement, i: number) => {
			if (i === this.index) {
				item.classList.add("text-green-700")
			} else {
				item.classList.remove("text-green-700")
			}
		})
	}

	/**
	 * @description Clean up the experience module and events
	 */
	onUnMount(): void {
		this.observe(false)
		window.removeEventListener("scroll", this.onScroll)
	}
}
