# ec4-v2-vue

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
yarn
```

### Compile and Hot-Reload for Development

```sh
yarn dev
```

### Type-Check, Compile and Minify for Production

```sh
yarn build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
yarn test:unit
```

### Lint with [ESLint](https://eslint.org/)

```sh
yarn lint
```

## TODO

- Bug: When loading the root url, the empty bundle is shown and immediately saved (creates a new entry)
- Write protect bundle checkmark? Is there an easy way to make all inputs/links/... disabled?
- Undo functionality somehow? Pinia has something built in
- IDEA: Shift + Ctrl + nav or eg Alt + Tab could select a range of encoders (eg for inserting incremental values)
- Send to EC4 activity indicator? Or a modal you can't dismiss? Or a simulated progress bar that also blocks further midi IO?

