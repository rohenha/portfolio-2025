import Mmodule from "@js/classes/module"

export default class Terminal extends Mmodule {
	private parent: HTMLElement | null
	constructor(params: any) {
		super(params)
		this.parent = null
	}

	onMount() {
		const [openButton] = this.$("openButton")
		this.animate("initTerminal", () => {
			openButton.style.display = "flex"
			if (openButton) {
				openButton.addEventListener("click", () => {
					this.enable()
				})
			}
		})
	}

	setIntroPopin(): Promise<void> {
		return new Promise((resolve) => {
			const parent = document.createElement("div")
			parent.classList.add(
				"m-terminal",
				"fixed",
				"bottom-md",
				"left-md",
				"z-10",
				"bg-[#01123c]",
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
					<p class="text-[1rem] tracking-sm">&rarr; ~ Pour connaitre les commandes : \`help\`</p>
					<p class="text-[1rem] tracking-sm text-gray-500/60">&rarr; ~ <input type="text" class="shrink-0 text-[1rem] tracking-sm focus:outline-0" data-terminal="input" /></p>
				</div>
				`

			this.parent = parent
			this.animate("initTerminal", () => {
				document.body.appendChild(parent)
				const [input] = this.$("input")
				const [closeButton] = this.$("close")
				closeButton.addEventListener("click", () => {
					this.disable()
				})
				input.addEventListener("keydown", this.onKeyDown.bind(this))
				resolve()
			})
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
			this.addMessage(value, "success").then(() => {
				if (value === "help") {
					this.addMessage(
						"Usage : help, hint : [chiffre], place : [chiffre]",
						"success",
						false,
					)
					return
				}
				if (value.startsWith("hint ")) {
					this.checkCommand(
						"hint",
						value,
						{
							error: "Veuillez entrer un index après 'hint '",
							success: "Voici l'indice {index} : {message}",
							notFound: "Aucun indice trouvé pour l'index {index}",
						},
						this.getIndice,
					)
					return
				}

				if (value.startsWith("place ")) {
					this.checkCommand(
						"place",
						value,
						{
							error: "Veuillez entrer un index après 'place '",
							success: "Voici l'emplacement de l'indice {index} : {message}",
							notFound: "Aucun emplacement trouvé pour l'index {index}",
						},
						this.getPlace,
					)
					return
				}

				this.addMessage(
					`La commande "${value}" n'est pas reconnue.`,
					"error",
					false,
				)
			})
		}
	}

	checkCommand(
		command: string,
		value: string,
		messages: { error: string; success: string; notFound: string },
		callback:
			| ((index: string | number) => string | boolean)
			| ((index: number) => string | boolean),
	): void {
		const place = value.split(`${command} `)[1].trim()
		const indexBase = parseInt(place, 10)
		const index = indexBase - 1
		if (!place) {
			this.addMessage(messages.error, "error", false)
			return
		}
		const message = callback(index)
		if (!message || typeof message === "boolean") {
			this.addMessage(
				`${messages.notFound.replace("{index}", indexBase.toString())}`,
				// `Aucun indice trouvé pour l'index ${index}`,
				"error",
				false,
			)
			return
		}
		this.addMessage(
			`${messages.success.replace("{index}", indexBase.toString()).replace("{message}", message)}`,
			"success",
			false,
		)
		return
	}

	createMessage(
		message: string,
		type: "success" | "error",
		prefix: boolean = true,
	): HTMLElement {
		const messageElement = document.createElement("p")
		messageElement.classList.add("text-[1rem]", "tracking-sm")
		if (type === "error") {
			messageElement.classList.add("text-green-700")
		}
		messageElement.innerHTML = prefix ? `&rarr; ~ ${message}` : message
		return messageElement
	}

	addMultipleMessages(
		messages: { message: string; type: "success" | "error" }[],
	): Promise<void> {
		if (!this.parent) {
			return Promise.resolve()
		}
		const els = messages.map((m) => this.createMessage(m.message, m.type))
		return new Promise((resolve) => {
			const [content] = this.$("content")
			this.animate("addTerminalMessage", () => {
				els.forEach((el) => {
					content.insertBefore(el, content.lastElementChild!)
				})
				resolve()
			})
		})
	}

	addMessage(
		message: string,
		type: "success" | "error",
		prefix: boolean = true,
	): Promise<void> {
		if (!this.parent) {
			return Promise.resolve()
		}
		return new Promise((resolve) => {
			const [content] = this.$("content")
			const messageElement = this.createMessage(message, type, prefix)
			this.animate("addTerminalMessage", () => {
				content.insertBefore(messageElement, content.lastElementChild!)
				resolve()
			})
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

	async enable() {
		if (!this.parent) {
			await this.setIntroPopin()
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
