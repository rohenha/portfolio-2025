import Mmodule from "@js/classes/module"
import { isReduced, isMobile } from "@js/utils/tools"

export default class Fireworks extends Mmodule {
	private canvas!: HTMLCanvasElement
	private imageUrl: string
	private image: HTMLImageElement | null = null
	private sparks: any[] = []
	private sparksCount: number = 100
	private sparkWidth: number = 60
	private speed: number = 0.5
	constructor(params: any) {
		super(params)
		this.busMap = {
			"plugins:resizer:resize": "onResize",
		}
		const imgEl = this.el.querySelector("img")
		this.imageUrl = imgEl ? imgEl.getAttribute("src") || "" : ""
		if (this.imageUrl) {
			this.image = new window.Image()
			this.image.src = this.imageUrl
		}
	}

	onMount() {
		if (isReduced() || isMobile()) {
			return
		}
		this.onResize()
		this.el.addEventListener("click", this.triggerFireworks.bind(this))
	}

	initCanvas() {
		const canvas = document.createElement("canvas")
		canvas.width = window.innerWidth
		canvas.height = window.innerHeight
		canvas.classList.add(
			"fixed",
			"top-0",
			"left-0",
			"pointer-events-none",
			"z-50",
			"w-full",
			"h-full",
		)
		this.canvas = canvas
		this.animate("fireworks", () => {
			document.body.appendChild(canvas)
		})
	}

	triggerFireworks() {
		if (this.visible) {
			return
		}
		if (!this.canvas) {
			this.initCanvas()
		}
		this.visible = true
		this.sparks = []
		for (let i = 0; i < this.sparksCount; i++) {
			const width = Math.random() * 3 + this.sparkWidth
			const height = width * 1.2
			this.sparks.push({
				// x: Math.random() * (this.screen.width - size),
				x: Math.random() * (this.screen.width / 2) + this.screen.width / 4,
				y: this.screen.height + height,
				vx: Math.random() * 10 - 5,
				vy: Math.random() * 10 + 15,
				size: width,
				height: height,
				color: [
					Math.floor(Math.random() * 256),
					Math.floor(Math.random() * 256),
					Math.floor(Math.random() * 256),
				],
				opacity: 1,
			})
		}
		this.animate("fireworksAnimate", this.onRender.bind(this), true)
	}

	endFireworks() {
		this.visible = false
		this.cleanAnimation("fireworksAnimate")
	}

	onRender() {
		const ctx = this.canvas.getContext("2d")
		if (!ctx) {
			return
		}
		ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		this.sparks.forEach((spark) => {
			if (this.image && this.image.complete) {
				ctx.globalAlpha = spark.opacity
				ctx.drawImage(
					this.image,
					spark.x - spark.size / 2,
					spark.y - spark.height / 2,
					spark.size,
					spark.height,
				)
				ctx.globalAlpha = 1.0
			} else {
				ctx.beginPath()
				ctx.arc(spark.x, spark.y, spark.size, 0, 2 * Math.PI)
				ctx.fillStyle = `rgba(${spark.color[0]}, ${spark.color[1]}, ${
					spark.color[2]
				}, ${spark.opacity})`
				ctx.fill()
			}
			spark.x += spark.vx
			spark.y -= spark.vy
			spark.vy -= this.speed
		})
		this.sparks = this.sparks.filter(
			(spark) => spark.y < this.screen.height + spark.size + 40,
		)
		if (this.sparks.length === 0) {
			ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
			this.endFireworks()
		}
	}

	onUnMount(): void {
		if (this.canvas) {
			this.canvas.remove()
		}
	}

	onResize(): void {
		this.screen = {
			width: window.innerWidth,
			height: window.innerHeight,
		}
		if (!this.canvas) {
			return
		}

		this.animate("fireworksResize", () => {
			this.canvas.width = this.screen.width
			this.canvas.height = this.screen.height
		})
	}
}
