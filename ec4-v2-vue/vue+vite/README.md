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

- Track bundle being edited (in URL hash?). Highlight bundle in table. Show name above editor?
  - Then auto save can go to dexie instead of localStorage
- Load sysex from file (Drag to bundle list? vueuse dropzone)
- Progressive web app possible? Vite PWA plugin looks good
- Add legend for keyboard shortcuts
- Add 'copy to all' feature
- Add UI for link editing
- Rework the push/turn indication to be more intuitive (eg circular icon around the selected encoder)
