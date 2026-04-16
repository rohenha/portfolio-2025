import Mmodule from "@js/classes/module"
import { isReduced, isMobile } from "@js/utils/tools"
import {
	createProgram,
	createFullscreenQuad,
	createRenderTarget,
	resizeRenderTarget,
	destroyRenderTarget,
	destroyQuad,
	setUniform1f,
	setUniform2f,
	setUniform3f,
	setUniform1i,
	drawQuad,
	type QuadBuffers,
	type RenderTarget,
} from "@js/utils/webgl"
import { lerp } from "@js/utils/animations"

// Vite handles ?raw imports to inline the GLSL source as a string
import vertexSource from "@js/shaders/vertex.glsl?raw"
import noiseFragmentSource from "@js/shaders/noise-fragment.glsl?raw"
import asciiFragmentSource from "@js/shaders/ascii-fragment.glsl?raw"

export default class Background extends Mmodule {
	private timeout: ReturnType<typeof setTimeout> | null = null
	private gl!: WebGL2RenderingContext | null
	private canvas!: HTMLCanvasElement

	// Programs
	private noiseProgram!: WebGLProgram
	private asciiProgram!: WebGLProgram

	// Geometry
	private noiseQuad!: QuadBuffers
	private asciiQuad!: QuadBuffers

	// Render target (off-screen noise texture)
	private renderTarget!: RenderTarget

	// Animation
	private startTime: number = 0
	private lastFrameTime: number = 0
	private readonly frameDuration: number = 1000 / 30 // ~30 fps cap

	// Tweakable values
	private readonly dprScale: number = 0.75 // reduce resolution for perf
	private frequency: number = 5
	// private frequency: number = 1.5
	private speed: number = 0.05
	private brightness: number = 0.1
	private color: [number, number, number] = [0.8078, 0.8019, 0.3294] // #021a54
	private digit: number = 7
	private digitOpacity: number = 0
	private updateDigit: boolean = false
	// private color: [number, number, number] = [0.0, 0.5, 0.95]

	constructor(params: any) {
		super(params)
		this.busMap = {
			"plugins:resizer:resize": "onResize",
			"experience:loop": "resetExperience",
			"call:initNumber": "initNumber",
		}
		this.visible = true
	}

	async onMount(): Promise<void> {
		if (isReduced() || isMobile()) {
			return
		}

		const [trigger] = this.$("trigger")
		trigger?.addEventListener("click", () => {
			this.initNumber()
		})

		this.timeout = setTimeout(async () => {
			try {
				await this.initWebGL()
				this.observe(true)
				this.buildPipeline()
				this.onResize()
				this.startTime = performance.now()
				this.animate(
					"background",
					() => {
						this.render()
						trigger?.classList.add("-active")
					},
					true,
				)
			} catch {
				return
			}
		}, 2000)
	}

	private async initWebGL(): Promise<boolean> {
		return new Promise((resolve, reject) => {
			this.canvas = document.createElement("canvas")

			const gl = this.canvas.getContext("webgl2", {
				alpha: true,
				premultipliedAlpha: false,
				antialias: false,
			})

			if (!gl) {
				console.warn("WebGL2 not supported – background shader disabled")
				reject(false)
			}

			this.animate("addBackground", () => {
				this.el.appendChild(this.canvas)
				this.gl = gl
				resolve(true)
				setTimeout(() => {
					this.animate("addBackground", () => {
						this.canvas.classList.add("-active")
					})
				}, 10)
			})
		})
	}

	private buildPipeline(): void {
		const { gl } = this

		if (!gl) return

		// 1. Noise program (renders Perlin noise into an off-screen texture)
		this.noiseProgram = createProgram(gl, vertexSource, noiseFragmentSource)
		this.noiseQuad = createFullscreenQuad(gl, this.noiseProgram)

		// 2. ASCII program (samples the noise texture → ASCII characters)
		this.asciiProgram = createProgram(gl, vertexSource, asciiFragmentSource)
		this.asciiQuad = createFullscreenQuad(gl, this.asciiProgram)

		// 3. Off-screen render target
		this.renderTarget = createRenderTarget(
			gl,
			gl.canvas.width || 1,
			gl.canvas.height || 1,
		)
	}

	onResize(): void {
		if (!this.visible || !this.gl) return
		const dpr = this.dprScale
		const width = this.el.clientWidth
		const height = this.el.clientHeight

		this.canvas.width = Math.round(width * dpr)
		this.canvas.height = Math.round(height * dpr)

		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)

		resizeRenderTarget(
			this.gl,
			this.renderTarget,
			this.canvas.width,
			this.canvas.height,
		)
	}

	tween(value: number, target: number, duration: number): number {
		if (target - value < 0.01) {
			return target
		}
		return lerp(value, target, duration)
	}

	onRender(): void {
		if (!this.visible || !this.gl) return

		const now = performance.now()
		if (now - this.lastFrameTime < this.frameDuration) return
		this.lastFrameTime = now

		if (this.updateDigit) {
			this.digitOpacity = this.tween(this.digitOpacity, 1, 0.02)
		}
		// this.frequency = this.tween(this.frequency, 18, 0.04)

		const elapsed = (now - this.startTime) * 0.001 // seconds
		const { gl } = this
		const w = this.canvas.width
		const h = this.canvas.height

		// ── Pass 1: Render Perlin noise directly to screen ──

		// gl.bindFramebuffer(gl.FRAMEBUFFER, null)
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.renderTarget.framebuffer)
		gl.viewport(0, 0, w, h)
		gl.clearColor(0, 0, 0, 1)
		gl.clear(gl.COLOR_BUFFER_BIT)

		gl.useProgram(this.noiseProgram)
		setUniform1f(gl, this.noiseProgram, "uTime", elapsed)
		setUniform1f(gl, this.noiseProgram, "uFrequency", this.frequency)
		setUniform1f(gl, this.noiseProgram, "uSpeed", this.speed)
		setUniform1f(gl, this.noiseProgram, "uBrightness", this.brightness)
		setUniform1f(gl, this.noiseProgram, "uDigit", this.digit)
		setUniform1f(gl, this.noiseProgram, "uDigitOpacity", this.digitOpacity)
		setUniform2f(gl, this.noiseProgram, "uResolution", w, h)
		drawQuad(gl, this.noiseQuad)

		// // ── Pass 2: ASCII post-process → draw to screen ─────────────────

		gl.bindFramebuffer(gl.FRAMEBUFFER, null)
		gl.viewport(0, 0, w, h)
		gl.clearColor(0, 0, 0, 0)
		gl.clear(gl.COLOR_BUFFER_BIT)

		gl.useProgram(this.asciiProgram)

		// Bind noise texture to unit 0
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, this.renderTarget.texture)
		setUniform1i(gl, this.asciiProgram, "uTexture", 0)

		setUniform2f(gl, this.asciiProgram, "uResolution", w, h)
		setUniform3f(gl, this.asciiProgram, "uColor", ...this.color)

		drawQuad(gl, this.asciiQuad)
	}

	// ── Cleanup ────────────────────────────────────────────────────

	onUnMount(): void {
		clearTimeout(this.timeout!)
		this.active = false
		this.cleanAnimation("background")

		if (!this.gl) return

		const { gl } = this

		gl.deleteProgram(this.noiseProgram)
		gl.deleteProgram(this.asciiProgram)
		destroyQuad(gl, this.noiseQuad)
		destroyQuad(gl, this.asciiQuad)
		destroyRenderTarget(gl, this.renderTarget)
		this.observe(false)
		this.canvas.remove()
	}

	initNumber(): void {
		this.updateDigit = true
	}

	resetExperience(): void {
		this.updateDigit = false
		this.digitOpacity = 0
	}
}
