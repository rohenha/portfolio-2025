import Mmodule from "@js/classes/module"

export default class Resizer extends Mmodule {
	constructor(params: any) {
		super(params)
		this.busMap = {
			"plugins:resizer:resize": "onResize",
		}
	}

	async onMount(): Promise<void> {
		// setTimeout(async () => {
		// 	console.log("Resizer mounted")
		// 	const data = await this.emitAsync("call:counter", {
		// 		method: "test",
		// 	})
		// 	// const data = this.emit("call:counter", {
		// 	// 	method: "test2",
		// 	// })
		// 	console.log(data)
		// }, 1000)
	}

	onResize(): void {
		console.log("Resizer resized")
	}
}
