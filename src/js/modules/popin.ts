import Mmodule from "@js/classes/module"
import { retainFocus } from "@js/utils/accessibility"
import { animateCss, type CancelledPromise } from "@js/utils/animations"
import { isReduced } from "@js/utils/tools"
import { setFocusToFirstNode } from "@js/utils/accessibility"

export default class Popin extends Mmodule {
	private popinVisible: boolean = false
	private parent: HTMLElement
	private animation: CancelledPromise<void> | null = null
	private activeElement: HTMLElement | null = null
	constructor(params: any) {
		super(params)
		this.popinVisible = false
		this.onKeyDown = this.onKeyDown.bind(this)
		this.parent = this.render()
		this.onClick = this.onClick.bind(this)
		this.open = this.change.bind(this, true)
		this.close = this.change.bind(this, false)
	}

	toggleEvents(state: boolean): void {
		const functionName = state ? "add" : "remove"
		document[`${functionName}EventListener`]("keydown", this.onKeyDown)
		this.parent[`${functionName}EventListener`]("click", this.onClick)
	}

	scrollBehaviour(state: boolean): void {
		Object.assign(document.body.style, { overflow: state ? "hidden" : "" })
	}

	renderContent(): string {
		return `
			<p class="text-pmd tracking-sm">Bravo, tu as désactivé la boucle. Tu peux désormais naviguer sur le site sans retour à la case départ toutes les 5 minutes.</p>
			<p class="text-pmd tracking-sm mt-md">Merci d’avoir participé à mon enquête. Le but était de trouver un mini concept fun qui puisse agrémenter l’expérience tout en gardant un site très léger et le plus éco conçu possible. C’était aussi pour moi l’occasion de rendre un hommage au jeu Outer Wilds, qui m’a grandement inspiré. Si tu aimes l’exploration et les univers poétiques, fonce.</p>
			<p class="text-pmd tracking-sm mt-md">A bientôt !</p>
		`
	}

	renderFooter(): string {
		return `<a target="_blank" href="https://store.steampowered.com/app/753640/Outer_Wilds/?l=french" class="text-btn tracking-sm a-btnSecondary text-gray-900 rounded-sm px-[0.2rem] py-[0.3rem] hover:bg-gray-900 hover:text-gray-300 focus:outline-2 focus:outline-gray-900 focus:outline-offset-2 cursor-pointer">Découvrir Outer Wilds</a>`
	}

	render(): HTMLElement {
		const parent = document.createElement("div")
		parent.classList.add(
			"m-popin",
			"fixed",
			"top-0",
			"left-0",
			"z-99",
			"flex",
			"items-center",
			"justify-center",
			"w-full",
			"h-full",
		)
		parent.setAttribute("id", this.id)
		parent.setAttribute("aria-hidden", "true")
		parent.innerHTML = `
			<div class="m-popin__overlay absolute top-0 left-0 -z-1 flex w-full h-full items-center justify-center p-sm lg:p-md cursor-pointer" tabindex="-1" data-action="close">
				<div class="m-popin__container flex flex-col flex-nowrap overflow-y-auto w-full max-w-[70rem] max-h-full p-md bg-gray-300 lg:p-xlg cursor-default rounded-md" role="dialog" aria-modal="true" aria-labelledby="welcome-popin_title" data-transition="popin:toggle">
					${this.renderContent()}
					<footer class="flex items-center mt-md">
						${this.renderFooter()}
						<button data-action="close" class="text-btn tracking-sm a-btnSecondary text-gray-900 rounded-sm px-[0.2rem] py-[0.3rem] hover:bg-gray-900 hover:text-gray-300 focus:outline-2 focus:outline-gray-900 focus:outline-offset-2 ml-auto cursor-pointer">Fermer</button>
					</footer>
				</div>
			</div>`
		this.animate("popin:create", () => {
			document.body.appendChild(parent)
		})
		return parent
	}

	enter() {
		this.activeElement = document.activeElement as HTMLElement
		if (this.activeElement && this.activeElement.focus) {
			this.activeElement.focus()
		}
		this.animate("popin:open", () => {
			this.parent.removeAttribute("aria-hidden")
			if (isReduced()) {
				this.animate("popin:open", () => {
					this.parent.classList.add("-visible")
					setFocusToFirstNode(this.parent)
					this.afterEnter()
				})
			} else {
				const animationEnter = animateCss({
					name: `popin:toggle`,
					parent: this.el,
					handler: () => {
						this.parent.classList.add("-visible")
					},
				})
				animationEnter.then(() => {
					setFocusToFirstNode(this.parent)
					this.afterEnter()
				})
				this.animation = animationEnter
			}
		})
	}

	afterEnter() {}

	leave() {
		if (isReduced()) {
			this.animate("popin:close", () => {
				this.parent.classList.remove("-visible")
				this.parent.setAttribute("aria-hidden", "true")
				this.afterLeave()
			})
		} else {
			const animationClose = animateCss({
				name: `popin:toggle`,
				parent: this.el,
				handler: () => {
					this.parent.classList.remove("-visible")
				},
			})
			animationClose.then(() => {
				this.parent.setAttribute("aria-hidden", "true")
				this.afterLeave()
			})
			this.animation = animationClose
		}
	}

	afterLeave() {}

	onClick(e: Event) {
		const target = e.target as HTMLElement
		const { action } = target?.dataset
		if (action && this[action]) {
			this[action](e)
			target?.blur()
		}
	}

	onKeyDown(event: Event) {
		const keyboardEvent = event as KeyboardEvent
		if (keyboardEvent.key === "Escape") {
			this.close() // esc
			return
		}
		if (keyboardEvent.key === "Tab") {
			retainFocus(keyboardEvent, this.parent) // tab
		}
	}

	toggle() {
		this.change(!this.visible)
	}

	change(state: boolean) {
		if (this.popinVisible === state) {
			return
		}
		this.popinVisible = state
		this.scrollBehaviour(state)
		this.toggleEvents(state)
		this.animation?.cancel()
		// const buttons = this.getButtonsOpen()
		// this.toggleButtons(state, buttons)
		if (state) {
			this.enter()
		} else {
			this.leave()
		}
	}

	getButtonsOpen(): HTMLElement[] {
		return Array.from(
			document.querySelectorAll(
				`[data-action="open"][data-module-popin="${this.id}"]`,
			),
		) as HTMLElement[]
	}
}
