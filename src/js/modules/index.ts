import { type ModuleConfig } from "@js/classes/modular"
// import Scroll from "./scroll"
import Website from "./website"
import Hero from "./hero"

const config: Array<ModuleConfig> = [
	// {
	// 	name: "scroll",
	// 	module: Scroll,
	// },
	// {
	// 	name: "counter",
	// 	loader: () => import("./counter"),
	// },
	// {
	// 	name: "resizer",
	// 	loader: () => import("./resizer"),
	// },
	{
		name: "hero",
		module: Hero,
	},
	{
		name: "website",
		module: Website,
	},
]

export default config
