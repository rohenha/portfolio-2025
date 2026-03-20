type Handler<T = any> = (payload: T) => void

export default class EventBus {
	private listeners = new Map<string, Set<Handler>>()
	private prefixListeners = new Map<string, Set<Handler>>()

	private getPrefixes(event: string): string[] {
		const parts = event.split(":")
		const prefixes: string[] = []
		for (let i = 1; i < parts.length; i += 1) {
			prefixes.push(parts.slice(0, i).join(":"))
		}
		return prefixes
	}

	private cleanup(map: Map<string, Set<Handler>>, key: string) {
		const set = map.get(key)
		if (set && set.size === 0) {
			map.delete(key)
		}
	}

	on<T>(event: string, handler: Handler<T>) {
		const set = this.listeners.get(event) || new Set()
		set.add(handler as Handler)
		this.listeners.set(event, set)

		this.getPrefixes(event).forEach((prefix) => {
			const prefixSet = this.prefixListeners.get(prefix) || new Set()
			prefixSet.add(handler as Handler)
			this.prefixListeners.set(prefix, prefixSet)
		})

		return () => this.off(event, handler)
	}

	off<T>(event: string, handler: Handler<T>) {
		const set = this.listeners.get(event)
		set?.delete(handler as Handler)
		this.cleanup(this.listeners, event)

		this.getPrefixes(event).forEach((prefix) => {
			const prefixSet = this.prefixListeners.get(prefix)
			prefixSet?.delete(handler as Handler)
			this.cleanup(this.prefixListeners, prefix)
		})
	}

	getHandlers(event: string): Handler[] {
		const handlers = new Set<Handler>()
		this.listeners.get(event)?.forEach((h) => handlers.add(h))
		this.prefixListeners.get(event)?.forEach((h) => handlers.add(h))
		// console.log(`Getting handlers for event "${event}":`, Array.from(handlers))
		// console.log(this.listeners, this.prefixListeners)
		return Array.from(handlers)
	}

	emit<T>(event: string, payload?: T): any[] {
		return this.getHandlers(event).map((handler) => handler(payload))
	}

	async emitAsync<T, R = any>(event: string, payload?: T): Promise<R[]> {
		return Promise.all(
			this.getHandlers(event).map((handler) =>
				Promise.resolve(handler(payload) as R),
			),
		)
	}
}
