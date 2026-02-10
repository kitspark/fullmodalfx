# fullmodalfx

fullmodalfx is a lightweight, dependency-free fullscreen modal library. It provides animated transitions, scroll locking, and lifecycle hooks using native DOM APIs.

## Features

- Dependency-free, modern TypeScript implementation
- Stack-aware modal handling (open a new modal while closing the previous seamlessly)
- Scroll locking with scrollbar compensation
- Built-in CSS for quick integration
- Lifecycle hooks for open/close events

## Installation

```bash
pnpm add @kitspark/fullmodalfx
```

## Usage

### HTML

```html
<a href="#demo-modal" data-modal-trigger>Open modal</a>

<div id="demo-modal">
  <div class="fmfx-modal__content">
    <button data-modal-close>Close</button>
    <p>Modal content goes here.</p>
  </div>
</div>
```

### JavaScript

```ts
import { initFullModalFX, createFullModalFX } from "@kitspark/fullmodalfx";
import "@kitspark/fullmodalfx/styles.css";

// Auto-bind all triggers with data-modal-trigger
initFullModalFX();

// Or configure a single modal instance
createFullModalFX({
  trigger: "#custom-trigger",
  modal: "#custom-modal",
  beforeOpen: (instance) => {
    console.log("opening", instance);
  }
});
```

### Styling

The library ships with a base stylesheet. Add `fmfx-modal__content` to your modal container and customize it as desired.

## API

### `createFullModalFX(options)`

Creates an instance of `FullModalFX`.

**Options:**

- `modal`: Selector or element for the modal.
- `trigger`: Selector or element to open the modal. If it is an anchor with a hash, the modal is inferred.
- `closeSelector`: Selector for close buttons inside the modal (default: `[data-modal-close]`).
- `closePreviousOnOpen`: Close the previous modal immediately when another opens (default: `true`).
- `animatedInClass`: CSS class for opening animation (default: `fmfx-fade-in`).
- `animatedOutClass`: CSS class for closing animation (default: `fmfx-fade-out`).
- `animationDurationMs`: Duration for animations (default: `200`).
- `beforeOpen`, `afterOpen`, `beforeClose`, `afterClose`: Lifecycle callbacks.

### `initFullModalFX(selector)`

Auto-binds all triggers matching the selector (default: `[data-modal-trigger]`).

### Instance methods

- `open()`
- `close()`
- `destroy()`

## Development

```bash
pnpm install
pnpm test
pnpm build
```

## Releasing

First time only (required to create the package on npm):

```bash
npm login
npm publish --access public
```

After trusted publishing is configured on npm for `@kitspark/fullmodalfx`:

1. Commit and push your changes to `main`.
2. GitHub → Actions → “Release” → Run workflow → choose `patch`/`minor`/`major`.
3. The tag push triggers the publish workflow and uploads the new version to npm.

## License

MIT
