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
