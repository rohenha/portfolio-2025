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

	afterContentReplace({
		containers,
		to,
	}: {
		containers: Array<HTMLElement>
		to: { hash: string; html: string; url: string }
	}) {
		this.updateContent(containers, "app:update")
		this.updateNav(to)
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

	updateNav(to: { hash: string; html: string; url: string }): void {
		const navLinks = this.$("navLink")
		this.emit("plugins:animations:add", {
			name: `${this.moduleKey}.nav`,
			animation: {
				animate: () => {
					navLinks.forEach((link) => {
						const url = link.getAttribute("href")
						console.log(`Comparing ${url} with ${to.url}`)
						if (
							url === to.url ||
							(to.url.startsWith(url as string) && to.url !== "/")
						) {
							link.setAttribute("aria-current", "page")
						} else {
							link.removeAttribute("aria-current")
						}
					})
				},
				keep: false,
			},
		})
	}
}
