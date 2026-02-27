import { type ModuleConfig } from "@js/classes/modular"
// import Scroll from "./scroll"
import Website from "./website"
// import Hero from "./hero"
import Experience from "./experience"
import Morse from "./morse"

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
		name: "morse",
		module: Morse,
	},
	{
		name: "experience",
		module: Experience,
	},
	{
		name: "hero",
		loader: () => import("./hero"),
	},
	{
		name: "website",
		module: Website,
	},
	{
		name: "tree",
		loader: () => import("./tree"),
	},
]

export default config
