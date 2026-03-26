# Resize plugin

Custom plugin to centralize event listener

## Install

```sh
npm install modujs
```

## Usage

#### Main file

```js
import Modular from "@js/classes/modular"
import modules from "@js/modules/index"
import ResizePlugin from "@js/classes/resize-plugin"

new Modular({
	modules,
	plugins: [
		[ResizePlugin]
	],
})
```

## Event Bus

```js
import Mmodule from "@js/classes/module"

export default class Scroll extends Mmodule {
		constructor(params: any) {
		super(params)
		this.customEvents = {
			"resizer:resize": "onResize",
		}
	}

	onResize() {
		console.log('resize fired')
	}
}
```
