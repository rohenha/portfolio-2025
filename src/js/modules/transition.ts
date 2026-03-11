import Mmodule from "@js/classes/module"
import { shouldNotIntercept } from "@js/utils/tools"
import { animateCss, type CancelledPromise } from "@js/utils/animations"

type TransitionParams = {
	from: { url: string; container: HTMLElement; title: string }
	to: { url: string; container: HTMLElement; title: string }
}

export default class Transition extends Mmodule {
	private loading: boolean
	constructor(params: any) {
		super(params)
		this.loading = false
	}
	onMount() {
		const html = document.documentElement
		this.animate("enter", () => {
			html.classList.add("is-changing")
			this.animate("enter", () => {
				this.onPageView()
				const url = new URL(location.href)
				this.emit("toggleExperience:experience:experience", {
					enable: ["/", "/methodo", "/a-propos"].includes(url.pathname),
				})
			})
			setTimeout(() => {
				this.animate("enter", () => {
					html.classList.remove("t-initTemplate")
					html.classList.remove("is-changing")
				})
			}, 1500)
		})

		window.addEventListener("popstate", (e: PopStateEvent) => {
			if (shouldNotIntercept(e) || this.loading) return
			this.loading = true
			const toPath = location.pathname
			const fromPath =
				document.documentElement.getAttribute("data-current-path")
			if (toPath === fromPath) {
				this.loading = false
				return
			}
			this.handleNavigationEvent(toPath, fromPath as string, false)
		})

		this.el.addEventListener("click", (e: MouseEvent) => {
			const target = e.target as HTMLElement
			const link = target.closest("a")
			if (!link) return
			const href = link.getAttribute("href")
			if (!href || href.startsWith("#") || link.target === "_blank") return
			e.preventDefault()
			console.log(this.loading, href)
			if (this.loading) return
			this.loading = true
			const toUrl = new URL(link.href)
			const toPath = toUrl.pathname
			const fromPath = location.pathname
			this.handleNavigationEvent(toPath, fromPath, true)
		})

		// navigation.addEventListener("navigate", (navigateEvent: AnimationEvent) => {
		// 	if (shouldNotIntercept(navigateEvent) || this.loading) return
		// 	this.loading = true
		// 	const toUrl = new URL(navigateEvent.destination.url)
		// 	const toPath = toUrl.pathname
		// 	const fromPath = location.pathname

		// 	if (location.origin !== toUrl.origin) return

		// 	this.handleNavigationEvent(navigateEvent, toPath, fromPath)
		// })
	}

	onPageView() {
		this.emit("website:loaded")
	}

	async leave({ from }: TransitionParams): Promise<CancelledPromise<void>> {
		const animationLeave = animateCss({
			name: "container",
			parent: from.container,
			handler: () => {
				from.container.classList.add("-animating")
			},
		})
		return animationLeave
	}

	async enter({ to }: TransitionParams): Promise<CancelledPromise<void>> {
		this.updateNav(to.url)
		const animationEnter = animateCss({
			name: "container",
			parent: to.container,
			handler: () => {
				to.container.classList.add("-enter")
				this.onPageView()
			},
		})
		animationEnter.then(() => {
			this.animate("transition:entered", () => {
				to.container.classList.remove("-enter")
				to.container.classList.remove("-animating")
			})
		})
		return animationEnter
	}

	updateNav(toUrl: string): void {
		const navLinks = this.$("navLink")
		this.animate("nav", () => {
			navLinks.forEach((link) => {
				const url = link.getAttribute("href")
				if (
					url === toUrl ||
					(toUrl.startsWith(url as string) && toUrl !== "/")
				) {
					link.setAttribute("aria-current", "page")
				} else {
					link.removeAttribute("aria-current")
				}
			})
		})
	}

	async handleNavigationEvent(
		// navigateEvent: AnimationEvent,
		toPath: string,
		fromPath: string,
		push: boolean = true,
	) {
		// navigateEvent.intercept({
		// 	scroll: "manual",
		// 	handler: async () => {
		const response = await fetch(toPath)
		const data = await response.text()
		const [container] = this.$("container")
		const newDoc = new DOMParser().parseFromString(data, "text/html")
		const newContainer = newDoc.querySelector('[data-transition="container"]')
		if (!newContainer) {
			console.error("No container found in the new page")
			return
		}
		if (push) {
			history.pushState(null, "", toPath)
		}
		newContainer.classList.add("-animating")
		const params: TransitionParams = {
			from: { url: fromPath, container, title: document.title },
			to: {
				url: toPath,
				container: newContainer as HTMLElement,
				title: newDoc.title,
			},
		}
		this.beforeLeave(params)
		await this.leave(params)
		await this.afterLeave(params)
		await this.enter(params)
		this.afterEnter(params)
		this.loading = false
		// 	},
		// })
	}

	beforeLeave(params: TransitionParams) {}
	afterLeave({ from, to }: TransitionParams) {
		return new Promise<void>((resolve) => {
			this.emit("app:destroy", { scope: from.container })
			this.emit("app:update", { scope: to.container })
			window.scrollTo(0, 0)
			this.animate("transition:enter", () => {
				document.title = to.title
				from.container.replaceWith(to.container)
				resolve()
			})
		})
	}
	afterEnter({ to }: TransitionParams) {
		this.emit("toggleExperience:experience:experience", {
			enable: ["/", "/methodo", "/a-propos"].includes(to.url),
		})
	}
}
