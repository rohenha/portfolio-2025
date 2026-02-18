import type { APIRoute } from "astro"
import { isProdSpace } from "@utils/config"

const getRobotsTxt = (sitemapURL: URL) => {
	if (!isProdSpace) {
		return `\
User-agent: *
Disallow: /

Sitemap: ${sitemapURL.href}
	`
	}
	return `\
User-agent: *
Allow: /

Sitemap: ${sitemapURL.href}
	`
}

export const GET: APIRoute = ({ site }) => {
	const sitemapURL = new URL("sitemap-index.xml", site)
	return new Response(getRobotsTxt(sitemapURL))
}
