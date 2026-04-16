import Mmodule from "@js/classes/module"
import { isReduced, isMobile } from "@js/utils/tools"

declare global {
	interface Window {
		experience?: any
	}
}

export default class Interactions extends Mmodule {
	constructor(params: any) {
		super(params)
	}

	async onMount(): Promise<void> {
		if (isReduced() || isMobile()) {
			return
		}
		// window.experience = this.callExperience.bind(this)
		const url = new URL(location.href)
		const params = new URLSearchParams(url.search)
		const interactionsParam = params.get("interactions")
		if (!interactionsParam || interactionsParam !== "1") {
			return
		}
		await this.emitAsync("app:addModules", [
			{
				name: "background",
				loader: () => import("./background"),
			},
			{
				name: "fireworks",
				loader: () => import("./fireworks"),
			},
			{
				name: "terminal",
				loader: () => import("./terminal"),
			},
			{
				name: "experience",
				loader: () => import("./experience"),
			},
			{
				name: "tree",
				loader: () => import("./tree"),
			},
		])
	}
}
