import { isProdSpace } from "@utils/config"

const metadata: MetadataProps = {
	siteName: "Romain Breton",
	siteUrl: isProdSpace
		? "https://www.romain-breton.com"
		: "https://preprod.romain-breton.com",
	lang: "fr",
	locale: "fr_FR",
	suffixTitle: " - Romain Breton",
	seoTitle: "Portfolio",
	seoDescription:
		"Romain Breton, full-stack developpeur orienté créatif, spécialisé dans l'écoconception, l'accessibilité et les performances web.",
	ogImage: "/assets/og-image.png",
	robots: isProdSpace ? "index, follow" : "noindex, nofollow",
	ogType: "website",
	ogTitle: "Romain Breton - Portfolio",
	ogDescription:
		"Romain Breton, full-stack developpeur orienté créatif, spécialisé dans l'écoconception, l'accessibilité et les performances web.",
	twitterCard: "summary_large_image",
	twitterSite: "@romain_breton",
	twitterCreator: "@romain_breton",
	colorMeta: "#ff3e00",
	metas: [],
}

export default metadata
