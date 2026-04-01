import Mmodule from "@js/classes/module"

export default class Terminal extends Mmodule {
	private parent: HTMLElement | null
	constructor(params: any) {
		super(params)
		this.parent = null
	}

	onMount() {
		const [openButton] = this.$("openButton")
		const parent = document.createElement("div")
		parent.classList.add(
			"m-terminal",
			"fixed",
			"bottom-md",
			"left-md",
			"z-10",
			"bg-gray-900",
			"w-[35rem]",
			"h-[20rem]",
			"rounded-md",
			"text-gray-300",
			"flex",
			"flex-col",
			"flex-nowrap",
			"opacity-0",
			"pointer-events-none",
		)
		parent.innerHTML = `
			<div class="text-center px-sm py-xsm text-[1rem] tracking-sm shrink-0">user@RomainBreton</div>
			<button data-terminal="close" class="absolute top-xsm left-xsm w-xsm h-xsm bg-green-700 rounded-[50%] cursor-pointer"><span class="sr-only">Fermer</span></button>
			<div data-terminal="content" class="m-terminal__content pt-xsm px-sm flex flex-col gapx-xsm h-full overflow-y-auto">
				<p class="text-[1rem] tracking-sm">&rarr; ~ Pour avoir un indice, tapez : \`indice : [index]\`</p>
				<p class="text-[1rem] tracking-sm">&rarr; ~ Pour un connaître l'emplacement d'un chiffre, tapez : \`emplacement : [index]\`</p>
				<p class="text-[1rem] tracking-sm text-gray-500/60">&rarr; ~ <input type="text" class="shrink-0 text-[1rem] tracking-sm focus:outline-0" data-terminal="input" /></p>
			</div>
			`

		this.parent = parent
		this.animate("initTerminal", () => {
			document.body.appendChild(parent)
			openButton.style.display = "flex"
			const [input] = this.$("input")
			const [closeButton] = this.$("close")
			closeButton.addEventListener("click", () => {
				this.disable()
			})
			input.addEventListener("keydown", this.onKeyDown.bind(this))
			if (openButton) {
				openButton.addEventListener("click", () => {
					this.enable()
				})
			}
		})
	}

	onUnMount(): void {
		if (!this.parent) {
			return
		}
		this.animate("removeTerminal", () => {
			this.parent!.remove()
			this.parent = null
		})
	}

	onKeyDown(e: KeyboardEvent): void {
		if (e.key === "Enter") {
			const target = e.target as HTMLInputElement
			const value = target.value.trim().toLowerCase()
			target.value = ""
			if (value.startsWith("indice :")) {
				const place = value.split("indice :")[1].trim()
				const index = parseInt(place, 10) - 1
				if (!place) {
					this.addMessage(
						"Veuillez entrer un chiffre après 'indice :'",
						"error",
					)
					return
				}
				const indice = this.getIndice(index)
				if (!indice) {
					this.addMessage(
						`Aucun indice trouvé pour le chiffre ${index}`,
						"error",
					)
					return
				}
				this.addMessage(`Voici l'indice ${index} : ${indice}`, "success")
				return
			}

			if (value.startsWith("emplacement :")) {
				const place = value.split("emplacement :")[1].trim()
				const index = parseInt(place, 10) - 1
				if (!place) {
					this.addMessage(
						"Veuillez entrer un chiffre après 'emplacement :'",
						"error",
					)
					return
				}
				const emplacement = this.getPlace(index)
				if (!emplacement) {
					this.addMessage(
						`Aucun emplacement trouvé pour le chiffre ${index}`,
						"error",
					)
					return
				}
				this.addMessage(
					`Voici l'emplacement de l'indice ${index} : ${emplacement}`,
					"success",
				)
				return
			}

			this.addMessage(`La commande "${value}" n'est pas reconnue.`, "error")
		}
	}

	addMessage(message: string, type: "success" | "error") {
		if (!this.parent) {
			return
		}
		const [content] = this.$("content")
		const messageElement = document.createElement("p")
		messageElement.classList.add("text-[1rem]", "tracking-sm")
		if (type === "error") {
			messageElement.classList.add("text-green-700")
		}
		messageElement.innerHTML = `&rarr; ~ ${message}`
		this.animate("addTerminalMessage", () => {
			content.insertBefore(messageElement, content.lastElementChild!)
		})
	}

	getPlace(index: number): string | boolean {
		const places = [
			"Hero Accueil",
			"Footer",
			"DOM HTML",
			"Devtools",
			"Page à propos",
			"Méthodologie",
			"Quête",
		]

		return places[index] || false
	}

	getIndice(index: number): string | boolean {
		const indices = [
			"Chercher un bouton",
			"Bip Bip Bip",
			"Inspecter le DOM",
			"Inspecter la console",
			"Survoler les compétences",
			"Noir sur noir ça ne se voit pas",
			"Vraiment ?",
		]
		return indices[index] || false
	}

	enable() {
		if (!this.parent) {
			return
		}
		const [openButton] = this.$("openButton")
		this.animate("toggleTerminal", () => {
			this.parent!.classList.add("-active")
			openButton.style.display = "none"
		})
	}

	disable() {
		if (!this.parent) {
			return
		}
		const [openButton] = this.$("openButton")
		this.animate("toggleTerminal", () => {
			this.parent!.classList.remove("-active")
			openButton.style.display = "flex"
		})
	}
}
