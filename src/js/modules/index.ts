import { type ModuleConstructor } from "@js/classes/module"
import Scroll from "./scroll"
import Website from "./website"
// export { default as TestScroll } from "./test-scroll"

export interface ModuleConfig {
	name: string
	module?: ModuleConstructor
	loader?: () => Promise<{ default: ModuleConstructor }>
}

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
		name: "test-scroll",
		loader: () => import("./test-scroll"),
	},
]

export default config
