import Mmodule, { type ModuleConstructorParams } from "@js/classes/module"

export default class Counter extends Mmodule {
	private interval: ReturnType<typeof setInterval> | null = null

	constructor(params: ModuleConstructorParams) {
		super(params)
		this.states = { number: 0 }
	}

	onMount() {
		this.observe(true)
	}

	onPageUpdate() {}

	onUpdateView(state: boolean) {
		if (state) {
			this.interval = setInterval(() => {
				this.states.number += 1
			}, 1000)
		} else {
			clearInterval(this.interval!)
		}
	}

	onWatch() {
		const [text] = this.$("message")
		this.animate("counter", () => {
			this.render(text)
		})
	}

	onRender(text: HTMLElement) {
		text.textContent = `Counter: ${this.states.number}`
	}

	onUnMount(): void {
		this.observe(false)
	}

	test() {
		return new Promise((resolve) => {
			resolve(
				`Hello from Scroll module async! Received your message: ${this.id}`,
			)
		})
	}

	test2() {
		return "Hello from Test module! This is test2 function."
	}
}
