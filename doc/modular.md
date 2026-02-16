<h1 align="center">Dynamic components</h1>
<p align="center">Vanilla micro framework for ES modules based on data attributes full typed</p>

## Install

```sh
npm install modujs
```

## Why

## Usage

#### Main file

```js
import Modular from "@js/classes/modular"
import modules from "@js/modules/index"

new Modular({
	modules,
	plugins: [],
})
```

#### Component file

```js
import Mmodule from "@js/classes/module"

export default class Scroll extends Mmodule {
	onMount() {
		console.log("Scroooooooooool")
	}
}
```

#### Define components

```js
import Scroll from "./scroll"
import { type ModuleConfig } from "@js/classes/modular"

const config: Array<ModuleConfig> = [
	{
		name: "scroll",
		module: Scroll,
	},
	{
		name: "test",
		loader: () => import("./test"),
	},
]

export default config
```

#### HTML call

```html
<div data-module-scroll></div>
<div data-module-test="idTest"></div>
```

Note : You can an ID directly in HTMLn, or modular will dynamicly set an
arbitrary id

## Lifecycle

1. Module construction
2. Method `mount` to internal init component
3. Event `onMount` to customize you component
4. Event `onPageUpdate` fired when page updates
5. Method `unmmount` to internal clean component
6. Method `onUnmount` to clean your component

## Methods

### Module

| Method | Description |

#### Events

| Event          | Description                                         |
| -------------- | --------------------------------------------------- |
| `onMount`      | Method auto called on module mounted                |
| `onPageUpdate` | Method auto called when modular update method fired |
| `onUnmount`    | Method auto called on module unmounted              |

## Bus Events

Dynamic components have a Event bus to connect app, components and plugins. 
Each module has an auto 

### Add Event

```js
this.emit()
```

## Examples
