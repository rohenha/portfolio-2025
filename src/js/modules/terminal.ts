import Mmodule from "@js/classes/module"

export default class Terminal extends Mmodule {
	private parent: HTMLElement | null
	private messageId: number = 0
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
					<p class="text-[1rem] tracking-sm">&rarr; ~ Il existe 7 codes à trouver allant de 1 à 7</p>
					<p class="text-[1rem] tracking-sm">&rarr; ~ Pour connaitre les commandes : \`help\`</p>
					<p class="flex items-center gap-tiny text-[1rem] tracking-sm text-gray-500/60"><span class="shrink-0">&rarr; ~</span> <input type="text" class="w-full text-[1rem] tracking-sm focus:outline-0" data-terminal="input" /></p>
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
				parent.addEventListener("click", () => {
					input.focus()
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
					this.addMessage("&nbsp;", "success", false)
					this.addMessage("<strong>Usage : \`help\`</strong>", "success", false)
					this.addMessage(
						"Permet de voir toutes les commandes disponibles",
						"success",
						false,
					)
					this.addMessage("&nbsp;", "success", false)
					this.addMessage(
						"<strong>Usage : \`indice [chiffre]\`</strong>",
						"success",
						false,
					)
					this.addMessage(
						"Vous donne une indication pour trouver l'indice en fonction du chiffre entré. Remplacez [chiffre] par un nombre",
						"success",
						false,
					)
					this.addMessage("&nbsp;", "success", false)
					this.addMessage(
						"<strong>Usage : \`emplacement [chiffre]\`</strong>",
						"success",
						false,
					)
					this.addMessage(
						"Vous donne l'emplacement de l'indice en fonction du chiffre entré. Remplacez [chiffre] par un nombre",
						"success",
						false,
					)
					this.addMessage("&nbsp;", "success", false, true)
					return
				}
				if (value.startsWith("indice ")) {
					this.checkCommand(
						"indice",
						value,
						{
							error: "Veuillez entrer un index après 'hint '",
							success: "Voici l'indice {index}",
							notFound: "Aucun indice trouvé pour l'index {index}",
						},
						this.getIndice,
					)
					return
				}

				if (value.startsWith("emplacement ")) {
					this.checkCommand(
						"emplacement",
						value,
						{
							error: "Veuillez entrer un index après 'place '",
							success: "Voici l'emplacement de l'indice {index}",
							notFound: "Aucun emplacement trouvé pour l'index {index}",
						},
						this.getPlace,
					)
					return
				}

				this.addMessage("&nbsp;", "success", false)
				this.addMessage(
					`La commande "${value}" n'est pas reconnue.`,
					"error",
					false,
				)
				this.addMessage("&nbsp;", "success", false, true)
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
		this.addMessage("&nbsp;", "success", false)
		if (!place) {
			this.addMessage(messages.error, "error", false)
			this.addMessage("&nbsp;", "success", false, true)
			return
		}
		const message = callback(index)
		if (!message || typeof message === "boolean") {
			this.addMessage(
				`${messages.notFound.replace("{index}", indexBase.toString())}`,
				"error",
				false,
			)
			this.addMessage("&nbsp;", "success", false, true)
			return
		}
		this.addMessage(
			`<strong>${messages.success.replace("{index}", indexBase.toString())}</strong>`,
			"success",
			false,
		)
		this.addMessage(message, "success", false)
		this.addMessage("&nbsp;", "success", false, true)
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
		end: boolean = false,
	): Promise<void> {
		if (!this.parent) {
			return Promise.resolve()
		}
		return new Promise((resolve) => {
			this.messageId += 1
			const [content] = this.$("content")
			const messageElement = this.createMessage(message, type, prefix)
			this.animate(`addTerminalMessage${this.messageId}`, () => {
				content.insertBefore(messageElement, content.lastElementChild!)
				if (end) {
					content.scrollTop = content.scrollHeight
				}
				resolve()
			})
		})
	}

	getPlace(index: number): string | boolean {
		const places = [
			"Allez dans la page d'accueil et le hero et survolez le titre",
			"Regardez dans le footer, et chercher du morse",
			"Jetez un oeil au DOM HTML dans l'inspecteur",
			"Regardez les messages dans la console",
			"Allez dans la page à propos de moi et cherchez du texte caché",
			"Allez dans la page Méthodologie, et regardez les technologies utilisées",
			"Rendez-vous directement sur la page de la quête",
		]

		return places[index] || false
	}

	getIndice(index: number): string | boolean {
		const indices = [
			"Chercher un bouton caché sur une des lettres",
			"Cherchez du morse à côté du bouton de quête",
			"Inspecter le DOM, cherchez des commentaires cachés",
			"Attendez devant la console et regardez les messages qui s'y affichent",
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
