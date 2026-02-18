# Create a custom Plugin

## Creation

```js
import ModularPlugin, {
	type ModulePluginInit,
} from "@js/classes/modular-plugin"

export default class CustomPlugin extends ModularPlugin {
	public name: string = "custom"
	constructor(m: ModulePluginInit) {
		super(m)
		const { params } = m
	}
}
```

## Usage

#### Main file

```js
import Modular from "@js/classes/modular"
import modules from "@js/modules/index"
import CustomPlugin from "@js/classes/custom-plugin"

new Modular({
	modules,
	plugins: [
		...,
		[CustomPlugin, /* params */]
	],
})
```

    	<div data-module-counter>
    		<p class="" data-counter="message">Counter: 0</p>
    	</div>
    	<div data-module-resizer>
    		<p class="">Resizer module</p>
    	</div>
