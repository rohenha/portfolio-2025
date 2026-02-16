import Mmodule from "@js/classes/module"

export default class Scroll extends Mmodule {
	onMount() {
		console.log("Scroooooooooool")
		// setTimeout(async () => {
		// 	// const data = await this.emitAsync("call:test", {
		// 	// 	method: "test",
		// 	// })
		// 	// console.log(data)
		// 	console.log(
		// 		this.bus.emit("call:test", {
		// 			method: "test2",
		// 		}),
		// 	)
		// }, 1000)
	}
}
