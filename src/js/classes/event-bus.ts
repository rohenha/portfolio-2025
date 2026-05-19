type Handler<T = any> = (payload: T) => void

export default class EventBus {
	private listeners = new Map<string, Set<Handler>>()
	private prefixListeners = new Map<string, Set<Handler>>()
	private prefixCache = new Map<string, string[]>()

	private getPrefixes(event: string): string[] {
		const cached = this.prefixCache.get(event)
		if (cached) return cached
		const parts = event.split(":")
		const prefixes: string[] = []
		for (let i = 1; i < parts.length; i += 1) {
			prefixes.push(parts.slice(0, i).join(":"))
		}
		this.prefixCache.set(event, prefixes)
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

	emit<T>(event: string, payload?: T): any[] {
		const exact = this.listeners.get(event)
		const byPrefix = this.prefixListeners.get(event)
		if (!exact && !byPrefix) return []
		const results: any[] = []
		exact?.forEach((h) => results.push(h(payload)))
		byPrefix?.forEach((h) => {
			if (!exact?.has(h)) results.push(h(payload))
		})
		return results
	}

	async emitAsync<T, R = any>(event: string, payload?: T): Promise<R[]> {
		const exact = this.listeners.get(event)
		const byPrefix = this.prefixListeners.get(event)
		if (!exact && !byPrefix) return []
		const promises: Promise<R>[] = []
		exact?.forEach((h) => promises.push(Promise.resolve(h(payload) as R)))
		byPrefix?.forEach((h) => {
			if (!exact?.has(h))
				promises.push(Promise.resolve(h(payload) as R))
		})
		return Promise.all(promises)
	}
}
