import { type ModuleConfig } from "@js/classes/modular"
// import Experience from "./experience"
// import Morse from "./morse"
// import Message from "./message"
import Transition from "./transition"
import Interactions from "./interactions"

const config: Array<ModuleConfig> = [
	// {
	// 	name: "morse",
	// 	module: Morse,
	// },
	{
		name: "transition",
		module: Transition,
	},
	// {
	// 	name: "experience",
	// 	module: Experience,
	// },
	{
		name: "hero",
		loader: () => import("./hero"),
	},
	// {
	// 	name: "tree",
	// 	loader: () => import("./tree"),
	// },
	{
		name: "interactions",
		module: Interactions,
	},
	// {
	// 	name: "message",
	// 	module: Message,
	// },
	// {
	// 	name: "hidden",
	// 	loader: () => import("./hidden"),
	// },
	{
		name: "projects",
		loader: () => import("./projects"),
	},
]

export default config
