/**
 * Minimal native WebGL2 helper – no external dependencies.
 * Provides utilities to compile shaders, create programs, fullscreen quads,
 * framebuffers (render targets) and uniform setters.
 */

// ─── Shader compilation ────────────────────────────────────────────

function compileShader(
	gl: WebGL2RenderingContext,
	type: number,
	source: string,
): WebGLShader {
	const shader = gl.createShader(type)
	if (!shader) throw new Error("Failed to create shader")

	gl.shaderSource(shader, source)
	gl.compileShader(shader)

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		const info = gl.getShaderInfoLog(shader)
		gl.deleteShader(shader)
		throw new Error(`Shader compilation error:\n${info}`)
	}

	return shader
}

// ─── Program linking ───────────────────────────────────────────────

export function createProgram(
	gl: WebGL2RenderingContext,
	vertexSource: string,
	fragmentSource: string,
): WebGLProgram {
	const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource)
	const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)

	const program = gl.createProgram()
	if (!program) throw new Error("Failed to create program")

	gl.attachShader(program, vertexShader)
	gl.attachShader(program, fragmentShader)
	gl.linkProgram(program)

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const info = gl.getProgramInfoLog(program)
		gl.deleteProgram(program)
		throw new Error(`Program link error:\n${info}`)
	}

	// Shaders are linked, we can free them
	gl.deleteShader(vertexShader)
	gl.deleteShader(fragmentShader)

	return program
}

// ─── Fullscreen quad geometry (clip-space) ─────────────────────────

export interface QuadBuffers {
	vao: WebGLVertexArrayObject
	positionBuffer: WebGLBuffer
	uvBuffer: WebGLBuffer
}

/**
 * Creates a fullscreen quad VAO with `position` (attribute 0) and `uv` (attribute 1).
 * The quad fills the entire clip-space (−1 … +1).
 */
export function createFullscreenQuad(
	gl: WebGL2RenderingContext,
	program: WebGLProgram,
): QuadBuffers {
	const vao = gl.createVertexArray()
	if (!vao) throw new Error("Failed to create VAO")
	gl.bindVertexArray(vao)

	// Positions – two triangles forming a full-screen quad
	// prettier-ignore
	const positions = new Float32Array([
		-1, -1,
		 1, -1,
		-1,  1,
		 1,  1,
	])

	const positionBuffer = gl.createBuffer()!
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)

	const posLoc = gl.getAttribLocation(program, "position")
	if (posLoc !== -1) {
		gl.enableVertexAttribArray(posLoc)
		gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)
	}

	// UVs
	// prettier-ignore
	const uvs = new Float32Array([
		0, 0,
		1, 0,
		0, 1,
		1, 1,
	])

	const uvBuffer = gl.createBuffer()!
	gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer)
	gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW)

	const uvLoc = gl.getAttribLocation(program, "uv")
	if (uvLoc !== -1) {
		gl.enableVertexAttribArray(uvLoc)
		gl.vertexAttribPointer(uvLoc, 2, gl.FLOAT, false, 0, 0)
	}

	gl.bindVertexArray(null)

	return { vao, positionBuffer, uvBuffer }
}

// ─── Render target (framebuffer + texture) ─────────────────────────

export interface RenderTarget {
	framebuffer: WebGLFramebuffer
	texture: WebGLTexture
}

export function createRenderTarget(
	gl: WebGL2RenderingContext,
	width: number,
	height: number,
): RenderTarget {
	const texture = gl.createTexture()!
	gl.bindTexture(gl.TEXTURE_2D, texture)
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		width,
		height,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		null,
	)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

	const framebuffer = gl.createFramebuffer()!
	gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
	gl.framebufferTexture2D(
		gl.FRAMEBUFFER,
		gl.COLOR_ATTACHMENT0,
		gl.TEXTURE_2D,
		texture,
		0,
	)

	gl.bindFramebuffer(gl.FRAMEBUFFER, null)
	gl.bindTexture(gl.TEXTURE_2D, null)

	return { framebuffer, texture }
}

export function resizeRenderTarget(
	gl: WebGL2RenderingContext,
	target: RenderTarget,
	width: number,
	height: number,
): void {
	gl.bindTexture(gl.TEXTURE_2D, target.texture)
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		width,
		height,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		null,
	)
	gl.bindTexture(gl.TEXTURE_2D, null)
}

// ─── Uniform helpers ───────────────────────────────────────────────

export function setUniform1f(
	gl: WebGL2RenderingContext,
	program: WebGLProgram,
	name: string,
	value: number,
): void {
	const loc = gl.getUniformLocation(program, name)
	if (loc) gl.uniform1f(loc, value)
}

export function setUniform2f(
	gl: WebGL2RenderingContext,
	program: WebGLProgram,
	name: string,
	x: number,
	y: number,
): void {
	const loc = gl.getUniformLocation(program, name)
	if (loc) gl.uniform2f(loc, x, y)
}

export function setUniform3f(
	gl: WebGL2RenderingContext,
	program: WebGLProgram,
	name: string,
	x: number,
	y: number,
	z: number,
): void {
	const loc = gl.getUniformLocation(program, name)
	if (loc) gl.uniform3f(loc, x, y, z)
}

export function setUniform1i(
	gl: WebGL2RenderingContext,
	program: WebGLProgram,
	name: string,
	value: number,
): void {
	const loc = gl.getUniformLocation(program, name)
	if (loc) gl.uniform1i(loc, value)
}

// ─── Draw helpers ──────────────────────────────────────────────────

export function drawQuad(gl: WebGL2RenderingContext, quad: QuadBuffers): void {
	gl.bindVertexArray(quad.vao)
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
	gl.bindVertexArray(null)
}

// ─── Cleanup ───────────────────────────────────────────────────────

export function destroyRenderTarget(
	gl: WebGL2RenderingContext,
	target: RenderTarget,
): void {
	gl.deleteFramebuffer(target.framebuffer)
	gl.deleteTexture(target.texture)
}

export function destroyQuad(
	gl: WebGL2RenderingContext,
	quad: QuadBuffers,
): void {
	gl.deleteBuffer(quad.positionBuffer)
	gl.deleteBuffer(quad.uvBuffer)
	gl.deleteVertexArray(quad.vao)
}
