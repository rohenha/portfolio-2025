import Mmodule from "@js/classes/module"

export default class Message extends Mmodule {
	private onReset: boolean
	private message: {
		array: Array<string>
		charIndex: number
		wordIndex: number
		delta: number
	}
	constructor(params: any) {
		super(params)
		this.index = 0
		this.interval = null
		this.busMap = {
			"experience:loop": "resetExperience",
			"website:loaded": "startMessage",
		}
		this.visible = true
		this.message = {
			array: [],
			charIndex: 0,
			wordIndex: 0,
			delta: 0,
		}
		this.onReset = true
		this.active = false
	}

	startMessage() {
		if (!this.onReset) {
			return
		}
		this.onReset = false
		const [data] = this.emit("call:experience:experience", {
			method: "getExperienceStatus",
		})
		this.message = {
			array:
				data.loop > 1
					? [
							"Bienvenue",
							"Attends, il s'est passé une chose étrange on est d'accord ?",
							"On ne serait pas dans une boucle temporelle ?",
							"Il doit exister un moyen de la désactiver.",
						]
					: ["Bienvenue"],
			charIndex: 0,
			wordIndex: 0,
			delta: 0,
		}

		this.animate(
			"message",
			() => {
				this.render()
			},
			true,
		)
	}

	resetExperience() {
		this.cleanAnimation("message")
		this.animate("messageReset", () => {
			this.el.innerHTML = ""
		})
		this.onReset = true
	}

	onRender(): void {
		this.message.delta -= 1
		if (this.message.delta > 0) {
			return
		}

		let newMessage =
			this.message.array[this.message.wordIndex][this.message.charIndex]
		this.message.charIndex += 1
		this.message.delta = 2

		if (
			this.message.charIndex >=
			this.message.array[this.message.wordIndex].length
		) {
			this.message.charIndex = 0
			this.message.wordIndex += 1
			this.message.delta = 40
			if (this.message.wordIndex >= this.message.array.length) {
				this.cleanAnimation("message")
			} else {
				newMessage += "<br/><br/>"
			}
		}

		this.el.innerHTML += newMessage
	}

	/**
	 * @description Clean up the experience module and events
	 */
	onUnMount(): void {
		// this.observe(false)
	}
}
