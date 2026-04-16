import { type ModuleConfig } from "@js/classes/modular"
import { isReduced, isMobile } from "@js/utils/tools"
import Transition from "./transition"

let config: Array<ModuleConfig> = [
	{
		name: "transition",
		module: Transition,
	},
	{
		name: "hero",
		loader: () => import("./hero"),
	},
	{
		name: "projects",
		loader: () => import("./projects"),
	},
]

if (!isReduced() && !isMobile()) {
	const url = new URL(location.href)
	const params = new URLSearchParams(url.search)
	const interactionsParam = params.get("interactions")
	if (interactionsParam && interactionsParam === "1") {
		config = [
			...config,
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
			{
				name: "popin-intro",
				loader: () => import("./popin-intro"),
			},
		]
	}
}

export default config
