import Popin from "./popin"

export default class PopinIntro extends Popin {
	renderContent(): string {
		return `
			<p class="text-pmd tracking-sm">Bienvenue,</p>
			<p class="text-pmd tracking-sm mt-md">Tu as activé le mode paillettes. Profite de petites animations qui agrémentent l'expérience. Mais en plus du côté funky, une boucle temporelle de 5 minutes a été mise en place pour te mettre au défi. Impossible à désactiver naturellement. Cherche des indices et sois curieux pour trouver le moyen de la désactiver. Pour commencer ton expérience, trouve le lien vers la quête qui t'expliquera plus en détail.</p>
			<p class="text-pmd tracking-sm mt-md">Bonne chance !</p>
		`
	}

	renderFooter(): string {
		return ``
	}
}
