import Swup from "swup"
import Mmodule from "@js/classes/module"

export default class Website extends Mmodule {
	init() {
		console.log("Website initialized")
		this.swup = new Swup({
			containers: ['[data-swup="container"]'],
		})
	}
}
