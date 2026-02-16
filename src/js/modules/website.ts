import Swup from "swup"
import Mmodule from "@js/classes/module"

export default class Website extends Mmodule {
	onMount() {
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
		this.updateContent(containers, "app:update")
	}

	beforeContentReplace({ containers }: { containers: Array<HTMLElement> }) {
		this.updateContent(containers, "app:destroy")
	}

	updateContent(
		containers: Array<HTMLElement>,
		method: "app:update" | "app:destroy",
	): void {
		const elements = containers.join(", ")
		const elementsModule = document.querySelectorAll(elements)
		elementsModule.forEach((element) => {
			this.emit(method, { scope: element })
		})
	}
}
