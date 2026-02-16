import Scroll from "./scroll"
import Website from "./website"
import { type ModuleConfig } from "@js/classes/modular"
// export { default as TestScroll } from "./test-scroll"

const config: Array<ModuleConfig> = [
	{
		name: "scroll",
		module: Scroll,
	},
	{
		name: "counter",
		loader: () => import("./counter"),
	},
	{
		name: "resizer",
		loader: () => import("./resizer"),
	},
	{
		name: "website",
		module: Website,
	},
]

export default config
