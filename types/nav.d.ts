type NavItem = {
	id?: string
	name: string
	url?: string
	external?: boolean
}

interface NavProps {
	header: Array<NavItem>
	footerPrimary: Array<NavItem>
	footerSecondary: Array<NavItem>
	socials: Array<NavItem>
}
