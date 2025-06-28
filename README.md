# PowerSync Devtools (PoC)

Proof of concept for Powersync devtools to see:

1. How devtools might look/function
2. How messages would be sent between a Powersync client and devtools
3. What needs to be added to `@powersync/web` to facilitate devtools

## Usage

### Building the extension

1. Install packages

```sh
pnpm install
```

2. Build the project

```sh
pnpm build
```

3. Open the Chrome Extensions window (chrome://extensions) and load the `dist` folder as an unpacked extension

> NB: Ensure the you are using the correct version of the PowerSync SDK ([this one](https://github.com/LucDeCaf/powersync-js/tree/feat/devtools-hooks)).

### Viewing the Devtools

1. Navigate to a webpage\* that uses PowerSync
2. Open the developer console (⌘⌥c)
3. Navigate to the 'PowerSync' tab

\* The devtools only work on webpages bundled with `import.meta.env === 'development'`

## Modifications to `@powersync/web`:

- `src/db/PowerSyncDatabase.ts`: Modify PowerSyncDatabase constructor to include `document.dispatchEvent` and `document.addEventListener` calls to know if/when/where to send data such that the extension can access it
