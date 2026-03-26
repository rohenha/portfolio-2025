# Create custom plugin

## Creation

```js
import Mmodule from "@js/classes/module"

export default class CustomComponent extends Mmodule {
	onMount() {
		console.log("Custom module")
	}
}
```

## Usage

#### Define component

```js
import CustomComponent from "./custom-component"
import { type ModuleConfig } from "@js/classes/modular"

const config: Array<ModuleConfig> = [
	{
		name: "custom-component",
		module: CustomComponent,
	},
	...,
]

export default config
```

#### HTML call

```html
<div data-module-custom-component></div>
```
