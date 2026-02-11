import Mmodule from "@js/classes/module"

export default class Test extends Mmodule {
	private interval: ReturnType<typeof setInterval> | null
	constructor(params: any) {
		super(params)
		this.interval = null
		this.toRender = true
		this.states = {
			number: 0,
			name: "Romain",
		}
	}

	onMount() {
		console.log("Test Scroooooooooool")

		setTimeout(() => {
			this.states.name = "John Doe"
		}, 4000)
		// setTimeout(() => {
		// 	const data = this.call(
		// 		"test",
		// 		{ message: `Hello from Scroll module! ${this.id}` },
		// 		"TestScroll",
		// 	)
		// 	data.then((response) => {
		// 		console.log("Response from test function:", response)
		// 	})
		// }, 1000)
	}

	onViewUpdate(state: boolean) {
		if (state) {
			this.interval = setInterval(() => {
				this.states.number += 1
			}, 1000)
		} else {
			clearInterval(this.interval!)
		}
	}

	onWatch() {
		this.render()
	}

	onRender() {
		const [text] = this.$("message")
		text.textContent = `State number: ${this.states.number} - State name: ${this.states.name}`
	}

	test() {
		// console.log("Received data in Scroll module:", data, this.id)
		return new Promise((resolve) => {
			resolve(`Hello from Scroll module! Received your message: ${this.id}`)
		})
	}

	onResize(): void {
		console.log("TestScroll resized")
	}
}
