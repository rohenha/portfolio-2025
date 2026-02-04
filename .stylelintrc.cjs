module.exports = {
	extends: [
		"stylelint-config-standard-scss",
		"stylelint-config-html",
		"stylelint-config-tailwindcss",
	],
	plugins: ["stylelint-order"],
	rules: {
		"order/properties-alphabetical-order": null,
		"order/properties-order": [
			[
				"composes",
				"content",
				"position",
				"top",
				"right",
				"bottom",
				"left",
				"z-index",
				"display",
				"flex",
				"flex-direction",
				"flex-wrap",
				"flex-flow",
				"flex-grow",
				"flex-shrink",
				"flex-basis",
				"justify-content",
				"align-items",
				"align-content",
				"order",
				// Ajoute ici l'ordre que tu préfères pour tes attributs CSS
			],
			{ unspecified: "bottomAlphabetical" },
		],
	},
}
