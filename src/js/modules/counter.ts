import Mmodule from "@js/classes/module"

export default class Counter extends Mmodule {
	private interval: ReturnType<typeof setInterval> | null
	constructor(params: any) {
		super(params)
		this.interval = null
		this.states = {
			number: 0,
		}
		this.busMap = {
			// "plugins:observer:update": "onUpdateView",
		}

		this.emit("plugins:observer:on", {
			el: this.el,
			key: `${this.moduleKey}`,
		})
	}

	onMount() {
		console.log("Counter mounted")
	}

	onPageUpdate() {
		console.log("Counter updated")
	}

	onUpdateView(state: boolean) {
		console.log(`Counter visibility: ${state}`)
		if (state) {
			this.interval = setInterval(() => {
				this.states.number += 1
			}, 1000)
		} else {
			clearInterval(this.interval!)
		}
	}

	onWatch() {
		this.emit("plugins:animations:add", {
			name: `${this.moduleKey}`,
			animation: {
				calculate: (): HTMLElement => {
					const [text] = this.$("message")
					return text
				},
				animate: (text: HTMLElement) => {
					this.render(text)
				},
			},
			keep: false,
		})
	}

	onRender(text: HTMLElement) {
		text.textContent = `Counter: ${this.states.number}`
	}

	onUnMount(): void {
		console.log("Counter unmounted")
		this.emit("observer:off", this.el)
	}
}
