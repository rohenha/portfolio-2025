import Mmodule from "@js/classes/module"

export default class Scroll extends Mmodule {
	onMount() {
		console.log("Scroooooooooool")
		setTimeout(async () => {
			const data = await this.emitAsync("call:test", {
				method: "test",
			})
			console.log(data)
		}, 1000)
	}
}
