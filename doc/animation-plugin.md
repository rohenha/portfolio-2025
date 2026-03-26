# Animation Plugin

Custom plugin to centralize animations with only one Request Animation Frame,
and separate calculation with DOM update

## Install

```sh
npm install modujs
```


## Usage

#### Main file

```js
import Modular from "@js/classes/modular"
import modules from "@js/modules/index"
import AnimationsPlugin from "@js/classes/animations-plugin"

new Modular({
	modules,
	plugins: [
		AnimationsPlugin,
	],
})
```

## Event Bus 

### Add 
```js
this.emit("plugins:animations:add", {
	name: `${this.moduleKey}`,
	animation: {
		calculate: (): HTMLElement => {
			const [text] = this.$("message")
			return text
		},
		animate: (text: HTMLElement) => {
			this.render(text)
		},
	},
	keep: false,
})
```

### Animate 

```js
this.animate("experience", () => {
	this.render()
})
```

### Parameters
| Name | type | description |
| `name` | `sring` | key id of your animation |
| `animation` | `{ calculate?: () => any, animate?: (any) => void, keep: boolean}` | object with animation configuration |
| `animation.calculate` | `() => any` | Method to query DOM elements, make your calculations. Do not update DOM here. Return params you will need in animate method |
| `animation.animate` | `(any) => void` | Method to sync update DOM with other modules. et in params values returned in calculate method.
| `animation.keep` | `boolean` | if you want to keep animation running or if you want to animate once |

### Remove 

```js
this.emit("plugins:animations:remove", this.moduleKey)
````

#### Parameters
| Name | type | description |
| id | string | string id of animation you used in the add method to remove animation |
