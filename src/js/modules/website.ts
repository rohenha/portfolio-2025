import Swup from "swup"
import Mmodule from "@js/classes/module"

export default class Website extends Mmodule {
	init() {
		console.log("Website initialized")
		this.swup = new Swup({
			containers: ['[data-swup="container"]'],
		})
		this.swup.hooks.on("content:replace", this.afterContentReplace.bind(this), {
			before: false,
		})
		this.swup.hooks.on(
			"content:replace",
			this.beforeContentReplace.bind(this),
			{
				before: true,
			},
		)
	}

	afterContentReplace({ containers }: { containers: Array<HTMLElement> }) {
		const elements = containers.join(", ")
		const elementsModule = document.querySelectorAll(elements)
		elementsModule.forEach((element) => {
			this.call("update", element, "self")
		})
		console.log("After content replace", elementsModule)
	}

	beforeContentReplace({ containers }: { containers: Array<HTMLElement> }) {
		const elements = containers.join(", ")
		const elementsModule = document.querySelectorAll(elements)
		elementsModule.forEach((element) => {
			this.call("destroy", element, "self")
		})
		console.log("Before content replace", elementsModule)
	}
}
