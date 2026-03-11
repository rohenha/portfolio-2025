/**
 * Debouncing enforces that a function not be called again until a certain amount of time has passed without it being called.
 * As in "execute this function only if 100 milliseconds have passed without it being called."
 *
 * @method debounce
 * @access public
 * @param {function} callback
 * @param {integer} delay
 * @returns {function}
 * @example
 * import { debounce } from "path/to/utils.js"
 *
 * document.body.addEventListener('scroll', debounce(
 *    () => {
 *      // Your code here
 *      // Executed 50ms after the user stops to scroll
 *    }, 50
 * ))
 */
export const debounce = <T extends unknown[]>(
	callback: (...args: T) => void,
	delay: number,
) => {
	let timeoutTimer: ReturnType<typeof setTimeout>

	return (...args: T) => {
		clearTimeout(timeoutTimer)

		timeoutTimer = setTimeout(() => {
			callback(...args)
		}, delay)
	}
}

export const throttle = <T extends unknown[]>(
	callback: (...args: T) => void,
	limit: number,
) => {
	let lastFunc: ReturnType<typeof setTimeout>
	let lastRan: number

	return function (...args: T) {
		if (!lastRan) {
			callback(...args)
			lastRan = Date.now()
		} else {
			clearTimeout(lastFunc)
			lastFunc = setTimeout(
				function () {
					if (Date.now() - lastRan >= limit) {
						callback(...args)
						lastRan = Date.now()
					}
				},
				limit - (Date.now() - lastRan),
			)
		}
	}
}

export const isReduced = () => {
	return window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true
}

export const isMobile = () => {
	return window.innerWidth < 768
}

export const shouldNotIntercept = (navigationEvent) => {
	return (
		navigationEvent.canIntercept === false ||
		// If this is just a hashChange,
		// just let the browser handle scrolling to the content.
		navigationEvent.hashChange ||
		// If this is a download,
		// let the browser perform the download.
		navigationEvent.downloadRequest ||
		// If this is a form submission,
		// let that go to the server.
		navigationEvent.formData
	)
}

export const getPersistentElement = (parent = document) => {
  return parent.querySelector('[data-persist="true"]')
}

export const getPersistentElementContainer = (parent = document) => {
  return parent.querySelector('[data-persist-container="true"]')
}
