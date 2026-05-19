import type EventBus from "@js/classes/event-bus"

/**
 * @description Base class providing bus event wiring (on/off/emit) and lifecycle
 * for both Mmodule and ModularPlugin. Avoids duplicating ~50 lines across both.
 */
export default class EventEmitter {
	[key: string]: any

	protected bus: EventBus
	protected busEvents: Map<string, () => void> = new Map()
	protected _busMap: Record<string, string> = {}
	protected busMap: Record<string, string> = {}

	constructor(bus: EventBus) {
		this.bus = bus
	}

	on(event: string, handler: (payload?: any) => void): void {
		const off = this.bus.on(event, handler)
		this.busEvents.set(event, off)
	}

	off(event: string): void {
		const off = this.busEvents.get(event)
		if (!off) return
		off()
		this.busEvents.delete(event)
	}

	emit(event: string, payload?: any) {
		return this.bus.emit(event, payload)
	}

	emitAsync(event: string, payload?: any): Promise<any[]> {
		return this.bus.emitAsync(event, payload)
	}

	/**
	 * @param keyFn Optional transformer applied to each event key before subscribing.
	 * Mmodule passes `(id) => \`${id}:${this.moduleKey}\`` to scope events per-instance.
	 * ModularPlugin uses the default identity (events are global by plugin name).
	 */
	protected initEvents(keyFn: (id: string) => string = (id) => id): void {
		const events = { ...this._busMap, ...this.busMap }
		for (const id in events) {
			const handler = this[events[id]]
			if (typeof handler === "function") {
				this.on(keyFn(id), handler.bind(this))
			}
		}
	}

	protected removeEvents(): void {
		this.busEvents.forEach((off) => off())
		this.busEvents.clear()
	}
}
