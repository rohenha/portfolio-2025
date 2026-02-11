import {
	type ModulePlugin,
	type ModulesCurrent,
	type ModulePluginMethod,
} from "@js/classes/modular"
import { debounce } from "@js/utils/tools"

export default function createResizePlugin({
	getModules,
}: {
	getModules: () => ModulesCurrent
}): ModulePlugin {
	let resizing = false
	let resizeModules: Array<string> = []
	let idsResizeToRemove: Array<string> = []

	const debouncedRemove = debounce(() => {
		if (idsResizeToRemove.length > 0) {
			resizeModules = resizeModules.filter(
				(moduleId) => !idsResizeToRemove.includes(moduleId),
			)
			idsResizeToRemove = []
		}
	}, 1000)

	const resize = () => {
		const currentModules = getModules()
		resizeModules.forEach((moduleId) => {
			const moduleInstance = currentModules[moduleId]
			moduleInstance.onResize()
		})
	}
	/**
	 * @description Call the resize method on all modules that have registered for resize events. This method is debounced to prevent excessive calls during window resizing.
	 * @returns void
	 */
	const debounceResize: () => void = debounce(resize, 450)

	const onModuleMount: (arg0: ModulePluginMethod) => void = ({
		instance,
		config,
	}) => {
		if (config.resize) {
			resizeModules.push(instance.id)
		}
	}

	const onUpdate = () => {
		if (resizeModules.length > 0 && !resizing) {
			window.addEventListener("resize", debounceResize)
			resizing = true
		} else {
			resizing = false
			window.removeEventListener("resize", debounceResize)
		}

		if (resizing) {
			resize()
		}
	}

	const onModuleUnMount: (arg0: ModulePluginMethod) => void = ({
		instance,
	}) => {
		const { id } = instance
		if (resizeModules.includes(id)) {
			idsResizeToRemove.push(id)
		}
		debouncedRemove()
	}

	return {
		name: "resize",
		onModuleMount,
		onUpdate,
		onModuleUnMount,
	}
}
