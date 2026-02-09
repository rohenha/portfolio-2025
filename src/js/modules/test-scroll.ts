import Mmodule from "@js/classes/module"
// import { module as Mmodule } from "modujs"

export default class TestScroll extends Mmodule {
	public static readonly mAttr: string = "test-scroll"
	init() {
		console.log("Test Scroooooooooool")
		// setTimeout(() => {
		// 	const data = this.call(
		// 		"test",
		// 		{ message: `Hello from Scroll module! ${this.id}` },
		// 		"test-scroll",
		// 	)
		// 	data.then((response) => {
		// 		console.log("Response from test function:", response)
		// 	})
		// }, 1000)
	}

	test() {
		// console.log("Received data in Scroll module:", data, this.id)
		return new Promise((resolve) => {
			resolve(`Hello from Scroll module! Received your message: ${this.id}`)
		})
	}
}
