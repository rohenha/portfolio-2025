export const getCookie = (name: string): string | null => {
	const value = `; ${document.cookie}`
	const parts = value.split(`; ${name}=`)
	if (parts.length === 2) {
		return parts.pop()?.split(";").shift() || null
	}
	return null
}

export const setCookie = (
	name: string,
	value: string,
	days: number,
	path = "/",
) => {
	const expires = new Date(Date.now() + days * 864e5).toUTCString()
	document.cookie = `${name}=${value}; expires=${expires}; path=${path}`
}

export const deleteCookie = (name: string, path = "/") => {
	document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`
}
