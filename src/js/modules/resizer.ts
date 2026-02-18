import Mmodule from "@js/classes/module"

export default class Resizer extends Mmodule {
	constructor(params: any) {
		super(params)
		this.busMap = {
			"plugins:resizer:resize": "onResize",
		}
	}

	onMount(): void {
		console.log("Resizer mounted")
	}

	onResize(): void {
		console.log("Resizer resized")
	}
}
