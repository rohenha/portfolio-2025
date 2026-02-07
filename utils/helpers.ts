export const formatLink = (link: NavItem, currentPage?: string): any => {
	const attributes: Record<string, string> = {}

	if (link.external) {
		attributes["target"] = "_blank"
	}

	if (currentPage && link.url === currentPage) {
		attributes["aria-current"] = "page"
	}

	return attributes
}

export const formatDate = (date: Date) => {
	return date.toLocaleDateString("fr-FR", {
		year: "numeric",
		month: "short",
		day: "numeric",
	})
}
