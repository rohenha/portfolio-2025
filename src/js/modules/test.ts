import Mmodule from "@js/classes/module"

export default class Test extends Mmodule {
	// private interval: ReturnType<typeof setInterval> | null
	constructor(params: any) {
		super(params)
		// this.interval = null
		// this.toRender = true
		this.states = {
			number: 0,
			name: "Romain",
		}
		this.customEvents = {
			"resizer:resize": "onResize",
			"observer:update": "onUpdateView",
		}

		this.emit("observer:on", {
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
		console.log("TestScroll view updated:", state)
		// if (state) {
		// 	this.interval = setInterval(() => {
		// 		this.states.number += 1
		// 	}, 1000)
		// } else {
		// 	clearInterval(this.interval!)
		// }
	}

	onWatch() {
		// this.call(
		// 	"add",
		// 	{
		// 		name: this.dataName,
		// 		animation: {
		// 			calculate: (): string => {
		// 				return "hello world"
		// 			},
		// 			animate: (text: string) => {
		// 				console.log(text)
		// 				this.render()
		// 			},
		// 		},
		// 	},
		// 	"plugin",
		// 	"animations",
		// )
	}

	onRender() {
		const [text] = this.$("message")
		text.textContent = `State number: ${this.states.number} - State name: ${this.states.name}`
	}

	test() {
		console.log("Test function called in Test module with ID:", this.id)
		// console.log("Received data in Scroll module:", data, this.id)
		return new Promise((resolve) => {
			resolve(`Hello from Scroll module! Received your message: ${this.id}`)
		})
	}

	onUnMount(): void {
		console.log("TestScroll unmounted")
		this.bus.emit("observer:off", `${this.dataName}_${this.id}`)
	}

	onResize(): void {
		console.log("TestScroll resized")
	}
}
