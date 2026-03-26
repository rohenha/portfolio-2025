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
		const background = document.querySelector("[data-module-background]")
		const promise = await this.emitAsync("app:addAloneModules", [
			{
				element: background,
				moduleItem: {
					name: "background",
					loader: () => import("./background"),
				},
			},
		])
		// promise[0][0].open()
	}
}
