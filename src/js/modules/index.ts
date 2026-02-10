import { type ModuleConstructor } from "@js/classes/module"
import Scroll from "./scroll"
import Website from "./website"
// export { default as TestScroll } from "./test-scroll"

export interface ModuleConfig {
	name: string
	module?: ModuleConstructor
	loader?: () => Promise<{ default: ModuleConstructor }>
	observe?: boolean
	repeat?: boolean
	resize?: boolean
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
		name: "test",
		loader: () => import("./test"),
		resize: true,
		observe: true,
		repeat: true,
	},
]

export default config
