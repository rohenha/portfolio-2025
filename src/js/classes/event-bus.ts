export type Handler<T = any> = (payload: T) => void

export default class EventBus {
	private listeners = new Map<string, Set<Handler>>()

	on<T>(event: string, handler: Handler<T>) {
		const set = this.listeners.get(event) || new Set()
		set.add(handler as Handler)
		this.listeners.set(event, set)
		return () => this.off(event, handler)
	}

	once<T>(event: string, handler: Handler<T>) {
		const off = this.on(event, (payload: T) => {
			off()
			handler(payload)
		})
		return off
	}

	off<T>(event: string, handler: Handler<T>) {
		this.listeners.get(event)?.delete(handler as Handler)
	}

	getHandlers(event: string): Handler[] {
		const handlers: Handler[] = []
		this.listeners.forEach((set, key) => {
			if (key.startsWith(`${event}:`) || key === event) {
				handlers.push(...set)
			}
		})
		return handlers
	}

	emit<T>(event: string, payload?: T): any[] {
		const handlers = this.getHandlers(event)
		return handlers.map((handler) => handler(payload))
	}

	async emitAsync<T, R = any>(event: string, payload?: T): Promise<R[]> {
		const handlers = this.getHandlers(event)
		return Promise.all(
			handlers.map((handler) => Promise.resolve(handler(payload) as R)),
		)
	}
}
