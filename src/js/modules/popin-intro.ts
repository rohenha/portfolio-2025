import Popin from "./popin"

export default class PopinIntro extends Popin {
	renderContent(): string {
		return `
			<p class="text-pmd tracking-sm">Bienvenue,</p>
			<p class="text-pmd tracking-sm mt-md">Tu as activé le mode paillettes. Au delà du côté funky, une boucle temporelle a pris le contrôle du site. Cherchez des indices et soyez curieux pour trouver le moyen de la désactiver. Pour commencer votre expérience, jetez un coup d'oeil au header et footer. N'oubliez pas que vous êtes sur le portfolio d'un développeur 😎</p>
			<p class="text-pmd tracking-sm mt-md">Bonne chance !</p>
		`
	}

	renderFooter(): string {
		return ``
	}
}
