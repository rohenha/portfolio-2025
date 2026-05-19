import Mmodule, { type ModuleConstructorParams } from "@js/classes/module"

export default class Resizer extends Mmodule {
	protected busMap = {
		"plugins:resizer:resize": "onResize",
	}

	constructor(params: ModuleConstructorParams) {
		super(params)
	}

	onMount(): void {}

	onResize(): void {}
}
