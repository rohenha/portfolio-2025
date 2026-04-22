import Popin from "./popin"

export default class PopinFinish extends Popin {
	renderContent(): string {
		return `
			<p class="text-pmd tracking-sm">Bravo, tu as désactivé la boucle. Tu peux désormais naviguer sur le site sans retour à la case départ toutes les 5 minutes.</p>
			<p class="text-pmd tracking-sm mt-md">Merci d’avoir participé à ma quête. Le but était de trouver un mini concept fun qui puisse agrémenter l’expérience tout en gardant le site le plus léger et le plus éco conçu possible. C’était aussi pour moi l’occasion de rendre un hommage au jeu Outer Wilds, qui m’a grandement inspiré. Si tu aimes l’exploration et les univers poétiques, fonce.</p>
			<p class="text-pmd tracking-sm mt-md">A bientôt !</p>
		`
	}

	renderFooter(): string {
		return `<a target="_blank" href="https://store.steampowered.com/app/753640/Outer_Wilds/?l=french" class="text-btn tracking-sm a-btnSecondary text-gray-900 rounded-sm px-[0.2rem] py-[0.3rem] hover:bg-gray-900 hover:text-gray-300 focus:outline-2 focus:outline-gray-900 focus:outline-offset-2 cursor-pointer">Découvrir Outer Wilds</a>`
	}
}
