#version 300 es

precision lowp float;

uniform vec2 uResolution;
uniform sampler2D uTexture;
uniform vec3 uColor;

in vec2 vUv;

out vec4 fragColor;

float character(int n, vec2 p) {
    p = floor(p * vec2(-4.0, 4.0) + 2.5);
    if (clamp(p.x, 0.0, 4.0) == p.x) {
        if (clamp(p.y, 0.0, 4.0) == p.y) {
            int a = int(round(p.x) + 5.0 * round(p.y));
            if (((n >> a) & 1) == 1)
                return 1.0;
        }
    }
    return 0.0;
}

void main() {
    vec2 pix = gl_FragCoord.xy;

    // Sample the noise texture at the center of each cell
    vec2 cell = floor(pix / 4.0) * 4.0;
    vec3 col = texture(uTexture, cell / uResolution).rgb;

    // Convert to grayscale (single dot product)
    float gray = dot(col, vec3(0.3, 0.3, 0.3));

    // Map grayscale to ASCII bitmasks using branchless step() mix
    // 5 levels: . : * o #
    int n = int(mix(float(4096),float(65600),step(0.2, gray)));  // . → :

    n = int(mix(float(n), float(163153),   step(0.4, gray)));  // : → *
    n = int(mix(float(n), float(15255082), step(0.6, gray)));  // * → o
    n = int(mix(float(n), float(11512810), step(0.8, gray)));  // o → #

    vec2 p = mod(pix / 1.0, 2.5) - vec2(0.9);

    // Apply the character mask with the chosen color tinted by brightness
    float charMask = character(n, p);
    vec3 finalColor = uColor * gray * charMask;

    fragColor = vec4(1.0 - finalColor, 0.7);
}
