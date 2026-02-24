export const FOCUSABLE_ELEMENTS = [
	"a[href]",
	"area[href]",
	'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
	"select:not([disabled]):not([aria-hidden])",
	"textarea:not([disabled]):not([aria-hidden])",
	'button:not([disabled]):not([aria-hidden]):not([aria-disabled="true"])',
	"iframe",
	"object",
	"embed",
	"[contenteditable]",
	'[tabindex]:not([tabindex^="-"])',
]

const getFocusableNodes = (parent: HTMLElement): Array<HTMLElement> => {
	const nodes = parent.querySelectorAll(
		FOCUSABLE_ELEMENTS.join(","),
	) as NodeListOf<HTMLElement>
	return Array.from(nodes)
}

export const retainFocus = (event: KeyboardEvent, parent: HTMLElement) => {
	let focusableNodes = getFocusableNodes(parent)
	// no focusable nodes
	if (focusableNodes.length === 0) return

	/**
	 * Filters nodes which are hidden to prevent
	 * focus leak outside modal
	 */
	focusableNodes = focusableNodes.filter((node) => node.offsetParent !== null)
	// if disableFocus is true
	if (!parent.contains(document.activeElement)) {
		focusableNodes[0].focus()
	} else {
		const focusedItemIndex = focusableNodes.indexOf(
			document.activeElement as HTMLElement,
		)

		if (event.shiftKey && focusedItemIndex === 0) {
			focusableNodes[focusableNodes.length - 1].focus()
			event.preventDefault()
		}

		if (
			!event.shiftKey &&
			focusableNodes.length > 0 &&
			focusedItemIndex === focusableNodes.length - 1
		) {
			focusableNodes[0].focus()
			event.preventDefault()
		}
	}
}

export const setFocusToFirstNode = (parent: HTMLElement) => {
	const focusableNodes = getFocusableNodes(parent)
	if (focusableNodes.length === 0) {
		return
	}
	if (focusableNodes.length > 0) {
		focusableNodes[0].focus()
	}
}
