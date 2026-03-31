import Mmodule from "@js/classes/module"
import { isReduced, isMobile } from "@js/utils/tools"

export default class Interactions extends Mmodule {
	constructor(params: any) {
		super(params)
	}

	async onMount(): Promise<void> {
		if (isReduced() || isMobile()) {
			return
		}

		const url = new URL(location.href)
		const params = new URLSearchParams(url.search)
		const interactionsParam = params.get("interactions")
		if (!interactionsParam || interactionsParam !== "1") {
			return
		}
		const promise = await this.emitAsync("app:addModules", [
			{
				name: "background",
				loader: () => import("./background"),
			},
			// {
			// 	name: "morse",
			// 	loader: () => import("./morse"),
			// },
			{
				name: "experience",
				loader: () => import("./experience"),
			},
			{
				name: "tree",
				loader: () => import("./tree"),
			},
			{
				name: "message",
				loader: () => import("./message"),
			},
			// {
			// 	name: "hidden",
			// 	loader: () => import("./hidden"),
			// },
		])
	}
}
