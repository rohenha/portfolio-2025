export type CancelledPromise<T> = Promise<T> & { cancel: () => void }

export const animateCss = ({
	name,
	parent,
	handler,
}: {
	name: string
	parent?: HTMLElement
	handler: () => void
}): CancelledPromise<void> => {
	const parentEl = parent || document.documentElement
	let items = parentEl.querySelectorAll(`[data-transition="${name}"]`).length
	if (parentEl.dataset.transition === name) {
		items += 1
	}
	let count = 0

	if (items === 0) {
		const resolved = Promise.resolve()
		return Object.assign(resolved, { cancel: () => {} })
	}

	let completed = false
	let resolvePromise: (value: void | PromiseLike<void>) => void
	let rejectPromise: (reason?: any) => void
	let raf: number | null = null
	const promise = new Promise<void>((resolve, reject) => {
		resolvePromise = resolve
		rejectPromise = reject
	})

	const cancel = () => {
		if (completed) {
			return
		}

		parentEl.removeEventListener("transitionend", afterTransition)
		if (raf) {
			window.cancelAnimationFrame(raf)
		}
		window.requestAnimationFrame(() => {
			rejectPromise(name)
		})
	}

	const afterTransition = (event: TransitionEvent) => {
		const targetEventName = (event.target as HTMLElement)?.dataset.transition
		if (targetEventName !== name) {
			return
		}

		count += 1
		if (count < items) {
			return
		}

		completed = true
		parentEl.removeEventListener("transitionend", afterTransition)
		window.requestAnimationFrame(() => {
			resolvePromise()
		})
	}

	parentEl.addEventListener("transitionend", afterTransition)

	raf = window.requestAnimationFrame(handler)
	return Object.assign(promise, { cancel })
}

export const lerp = (start: number, end: number, t: number): number => {
	return start * (1 - t) + end * t
}
