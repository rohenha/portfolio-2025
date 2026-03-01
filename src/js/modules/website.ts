import SwupRouteNamePlugin from "@swup/route-name-plugin"
import Mmodule from "@js/classes/module"
import Swup, { type Visit, type HookArguments } from "swup"

export default class Website extends Mmodule {
	onMount() {
		this.swup = new Swup({
			containers: ['[data-swup="container"]'],
			plugins: [
				new SwupRouteNamePlugin({
					routes: [
						{ name: "home", path: "/" },
						{ name: "methodo", path: "/methodo" },
						{ name: "about", path: "/a-propos" },
						{ name: "default", path: "(.*)" },
					],
				}),
			],
			cache: false,
			animateHistoryBrowsing: true,
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
		this.swup.hooks.on("animation:in:end", this.onPageView.bind(this), {
			before: false,
		})
		this.swup.hooks.on("enable", this.enter.bind(this), {
			before: false,
			once: true,
		})
		// this.enter()
	}

	enter(visit: Visit) {
		const html = document.documentElement
		this.animate("enter", () => {
			html.classList.add("is-changing")
			this.animate("enter", () => {
				this.onPageView()
				this.emit("toggleExperience:experience:experience", {
					enable: visit.to.route !== "default",
				})
			})
			setTimeout(() => {
				html.classList.remove("t-initTemplate")
				html.classList.remove("is-changing")
			}, 2000)
		})
	}

	onPageView() {
		this.emit("website:loaded")
	}

	/**
	 * @description Emit events to update modules within the specified containers and update navigation links after content replacement
	 */
	afterContentReplace(
		visit: Visit,
		{ page }: HookArguments<"content:replace">,
	) {
		this.updateContent(visit.containers, "app:update")
		window.scrollTo(0, 0)
		this.emit("toggleExperience:experience:experience", {
			enable: visit.to.route !== "default",
		})
		this.updateNav({
			hash: visit.to.hash,
			html: page.html,
			url: page.url,
		})
	}

	/**
	 * @description Emit events to destroy modules within the specified containers before content replacement
	 */
	beforeContentReplace(
		visit: Visit,
		args: HookArguments<"content:replace">,
	): void {
		void args
		this.updateContent(visit.containers, "app:destroy")
		// this.animate("toggle", () => {
		// 	document.body.classList.toggle("-experience", enable)
		// })
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
	updateNav(to: { hash?: string; html: string; url: string }): void {
		const navLinks = this.$("navLink")
		this.animate("nav", () => {
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
		})
	}

	navigate({ url }: { url: string }): void {
		this.swup?.navigate(url)
	}

	onUnMount() {
		this.swup?.destroy()
	}
}
