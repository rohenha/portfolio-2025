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
		name: "website",
		module: Website,
	},
	{
		name: "test",
		loader: () => import("./test"),
		resize: true,
		observe: true,
		repeat: true,
	},
]

export default config
