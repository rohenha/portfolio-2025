# Observer plugin

Custom plugin to add scroll toggle

## Install

```sh
npm install modujs
```

## Usage

#### Main file

```js
import Modular from "@js/classes/modular"
import modules from "@js/modules/index"
import ObserverPlugin from "@js/classes/observer-plugin"

new Modular({
	modules,
	plugins: [
		ObserverPlugin,
		{
			root: null,
			rootMargin: "0px",
			threshold: 0.1,
		} /* IntersectionObserver parameters */,
	],
})
```

#### Component file

```js
import Mmodule from "@js/classes/module"

export default class Scroll extends Mmodule {
		constructor(params: any) {
		super(params)
		this.visible = false
		this.customEvents = {
			"observer:update": "onUpdateView",
		}

		this.emit("observer:on", {
			el: this.el,
			key: `${this.dataName}:${this.id}`,
			once?: false
		})
	}

	onUpdateView(state: boolean) {
		console.log('Update view fired', state)
	}
}
```

## Event Bus

| Method         | Description                                                              | Params                                             |
| -------------- | ------------------------------------------------------------------------ | -------------------------------------------------- |
| `observer:on`  | Add observer on component. you can enable only once whith once parameter | `{ key: string, el: HTMLElement, once?: boolean }` |
| `observer:off` | Delete observer on component                                             | `key: string`                                      |

## Events

| Method            | Description                                                                                                                  |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `observer:update` | Event fired when el enters / leaves viewport. It will call internal method `updateView` then call your custom `onUpdateView` |

## Example

```js
import Mmodule from "@js/classes/module"

export default class Counter extends Mmodule {
	private interval: ReturnType<typeof setInterval> | null
	constructor(params: any) {
		super(params)
		this.interval = null
		this.states = {
			number: 0,
		}
		this.customEvents = {
			"observer:update": "onUpdateView",
		}

		this.bus.emit("observer:on", {
			el: this.el,
			key: `${this.dataName}:${this.id}`,
		})
	}

	onMount() {
		console.log("Counter mounted")
	}

	onPageUpdate() {
		console.log("Counter updated")
	}

	onUpdateView(state: boolean) {
		if (state) {
			this.interval = setInterval(() => {
				this.states.number += 1
			}, 1000)
		} else {
			clearInterval(this.interval!)
		}
	}

	onWatch() {
		this.emit("animations:add", {
			name: `${this.dataName}_${this.id}`,
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
	}

	onRender(text: HTMLElement) {
		text.textContent = `Counter: ${this.states.number}`
	}

	onUnMount(): void {
		console.log("Counter unmounted")
		this.bus.emit("observer:off", `${this.dataName}_${this.id}`)
	}
}
```
