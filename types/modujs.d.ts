declare module "modujs" {
	interface ModuleOptions {
		el: HTMLElement
		dataName: string
	}

	interface EventHandlers {
		[eventType: string]: string | { [dataName: string]: string }
	}

	interface ModuleCollection {
		[moduleName: string]: {
			[moduleId: string]: module
		}
	}

	export class module {
		// Properties
		mAttr: string
		mCaptureEvents: string[]
		el: HTMLElement
		modules: ModuleCollection
		events?: EventHandlers

		// Constructor
		constructor(options: ModuleOptions)

		// Module lifecycle methods
		mInit(modules: ModuleCollection): void
		mUpdate(modules: ModuleCollection): void
		mDestroy(): void

		// Event handling methods
		mAddEvent(event: string): void
		mRemoveEvent(event: string): void
		mCheckEventTarget(e: Event): void
		mCallEventMethod(
			e: Event,
			event: EventHandlers[string],
			target: HTMLElement,
		): void

		// Query methods
		$(query: string, context?: HTMLElement): NodeListOf<HTMLElement>
		parent(query: string, context: HTMLElement): HTMLElement | undefined

		// Data methods
		getData(name: string, context?: HTMLElement): string | null
		setData(name: string, value: string, context?: HTMLElement): void

		// Module communication methods
		call(func: string, args?: any, mod?: string, id?: string): void
		call(func: string, mod: string, id?: string): void
		on(e: string, mod: string, func: (event: Event) => void, id?: string): void

		// Lifecycle hooks (to be overridden)
		init(): void
		destroy(): void
	}

	// Export default class as well for compatibility
	export default module
}
