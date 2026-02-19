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
		this.swup.hooks.on("page:view", this.onPageView.bind(this))
		this.enter()
	}

	enter() {
		const html = document.documentElement
		this.emit("plugins:animations:add", {
			name: `${this.moduleKey}.enter`,
			animation: {
				animate: () => {
					html.classList.add("is-changing")
					setTimeout(() => {
						this.onPageView()
					}, 500)
					setTimeout(() => {
						html.classList.remove("t-initTemplate")
						html.classList.remove("is-changing")
					}, 2000)
				},
			},
		})
	}

	onPageView() {
		this.emit("website:loaded")
	}

	/**
	 * @description Emit events to update modules within the specified containers and update navigation links after content replacement
	 */
	afterContentReplace({
		containers,
		to,
	}: {
		containers: Array<string>
		to: { hash: string; html: string; url: string }
	}) {
		this.updateContent(containers, "app:update")
		window.scrollTo(0, 0)
		this.updateNav(to)
	}

	/**
	 * @description Emit events to destroy modules within the specified containers before content replacement
	 */
	beforeContentReplace({ containers }: { containers: Array<string> }) {
		this.updateContent(containers, "app:destroy")
	}

	/**
	 * @description Emit events to update or destroy modules within the specified containers
	 * @param containers - An array of container elements to target
	 * @param method - The event method to emit ("app:update" or "app:destroy")
	 * @returns void
	 */
	updateContent(
		containers: Array<string>,
		method: "app:update" | "app:destroy",
	): void {
		const elements = containers.join(", ")
		const elementsModule = document.querySelectorAll(elements)
		elementsModule.forEach((element) => {
			this.emit(method, { scope: element })
		})
	}

	/**
	 * @description Update the navigation links based on the current URL
	 * @param to - The target URL and related information
	 * @returns void
	 */
	updateNav(to: { hash: string; html: string; url: string }): void {
		const navLinks = this.$("navLink")
		this.emit("plugins:animations:add", {
			name: `${this.moduleKey}.nav`,
			animation: {
				animate: () => {
					navLinks.forEach((link) => {
						const url = link.getAttribute("href")
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
