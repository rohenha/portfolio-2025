/**
 * Configurations prédéfinies pour différents types d'images
 */

export const imageConfigs = {
	// Image d'article (largeur max 647px)
	article: {
		widths: [400, 647, 768, 1024],
		sizes: "(max-width: 768px) 95vw, (max-width: 1024px) 55vw, 647px",
		formats: ["avif", "webp"],
		quality: 80,
	},

	// Image de héros (pleine largeur)
	hero: {
		widths: [640, 768, 1024, 1280, 1440],
		sizes: "(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1440px",
		formats: ["avif", "webp"],
		quality: 85,
	},

	// Image de galerie (plus petite)
	gallery: {
		widths: [300, 400, 500, 600],
		sizes: "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px",
		formats: ["avif", "webp"],
		quality: 80,
	},

	// Thumbnail (très petite)
	thumbnail: {
		widths: [100, 150, 200],
		sizes: "(max-width: 768px) 25vw, 150px",
		formats: ["avif", "webp"],
		quality: 75,
	},
}

export default imageConfigs
