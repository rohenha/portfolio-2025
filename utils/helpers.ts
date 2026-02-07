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
