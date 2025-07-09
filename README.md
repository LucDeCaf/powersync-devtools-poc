**!!! IMPORTANT !!!**

The latest commit is from the middle of a rewrite and doesn't work. If you want to try the devtools, use the following links:
1. Devtools: https://github.com/LucDeCaf/powersync-devtools-poc/tree/7acd0fa93ab2d308ec9117c806d11deb5b950c42
2. Powersync SDK: https://github.com/LucDeCaf/powersync-js/tree/87d89cf1f3e99152c8e40ceee4af3539853829df

If these links don't work, reach out to me (or you can optionally go digging for the right commits yourself).

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

3. Open the Chrome Extensions window (chrome://extensions), enable developer mode, and load the `dist` folder as an unpacked extension

> NB: Ensure the you are using the latest version of the CUSTOM PowerSync SDK ([this one](https://github.com/LucDeCaf/powersync-js/tree/feat/devtools-hooks)).

### Viewing the Devtools

1. Navigate to a webpage\* that uses PowerSync
2. Open the developer console (⌘⌥c)
3. Navigate to the 'PowerSync' tab

\* The devtools only work on webpages bundled with `import.meta.env === 'development'` or `process.env.NODE_ENV === 'development'`.
