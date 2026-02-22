import Mmodule from "@js/classes/module"

export default class Counter extends Mmodule {
	// private interval: ReturnType<typeof setInterval> | null
	constructor(params: any) {
		super(params)
		// this.interval = null
		// this.toRender = true
		this.states = {
			number: 0,
		}
		this.customEvents = {
			"resizer:resize": "onResize",
			"observer:update": "onUpdateView",
		}

		this.bus.emit("plugins:observer:on", {
			el: this.el,
			key: `${this.dataName}:${this.id}`,
		})
	}

	onMount() {
		console.log("Test")

		// setTimeout(() => {
		// 	this.states.name = "John Doe"
		// }, 4000)
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

	onPageUpdate() {
		console.log("TestScroll updated")
	}

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
		this.emit("animations:add", {
			name: `${this.dataName}_${this.id}`,
			animation: {
				animate: () => {
					this.render()
				},
			},
			keep: false,
		})
	}

	onRender() {
		const [text] = this.$("message")
		text.textContent = `State number: ${this.states.number} - State name: ${this.states.name}`
	}

	test() {
		return new Promise((resolve) => {
			resolve(`Hello from Scroll module! Received your message: ${this.id}`)
		})
	}

	test2() {
		return "Hello from Test module! This is test2 function."
	}

	onUnMount(): void {
		console.log("TestScroll unmounted")
		this.bus.emit("plugins:observer:off", `${this.dataName}_${this.id}`)
	}

	onResize(): void {
		console.log("TestScroll resized")
	}
}
