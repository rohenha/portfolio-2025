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
		"Portfolio of Romain Breton, a web developer specializing in modern web technologies",
	ogImage: "/assets/og-image.png",
	robots: isProdSpace ? "index, follow" : "noindex, nofollow",
	ogType: "website",
	ogTitle: "Romain Breton - Portfolio",
	ogDescription:
		"Portfolio of Romain Breton, a web developer specializing in modern web technologies",
	twitterCard: "summary_large_image",
	twitterSite: "@romain_breton",
	twitterCreator: "@romain_breton",
	colorMeta: "#ff3e00",
	metas: [],
}

export default metadata
