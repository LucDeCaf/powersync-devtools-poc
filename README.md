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

## Architecture Overview

At a high-level, the app works as follows:

1. A script called a content script is injected into all pages before they finish loading. This script listens for the creation of new PowerSync clients and tells the extension's service worker about them.
2. The extension creates a custom devtools panel called 'PowerSync' which communicates with the extension's service worker to retrieve information about the page's PowerSync clients.
3. The service worker acts as a message-passing layer between the content script and the frontend.

### Entry points

The app has 3 relevant entry points:

1. `src/scripts/main.ts`: Content script injected into all pages before page load. Manages all PowerSync clients on one page and is responsible for sending PowerSync info to the devtools

2. `src/worker/service_worker.ts`: Service worker that spins up when it receives an event either from a content script or from a devtools instance. Responsible for transporting messages between content scripts and the devtools frontend.

3. `src/devtools/panel/App.tsx`: React app that acts as the frontend for the devtools. Responsible for displaying info for a given page's Powersync clients.

### Communication

Ideally, we would pass a `MessagePort` object or an `AsyncDatabaseConnection` from the Powersync client to the content script, from the content script to the service worker, and from the worker to the devtools frontend. From there, the frontend could use the `MessagePort` directly for communication, thereby eliminating the need for a whole messaging architecture.

However, because messages between scripts in the extension can only consist of JSON-serializable data (among other reasons), this sadly isn't an option.

As such, `MessagePort` objects are kept in the content script and `Message` objects are used for communication between content scripts, panels, and the service worker. A list of valid messages can be found in `src/types.d.ts`.

_NB: In the future, it may be possible to use an RPC library to simplify messaging._

### SDK modifications

When a `PowerSyncDatabase` is created, the constructor now checks if `import.meta.env === 'development'`. If running in a dev environment (and using the correct sync implementation), it posts the following message to the window:

```js
// PowerSyncDatabase.ts

/* ... */

window.postMessage(
    {
        type: 'POWERSYNC_CLIENT_INIT',
        data: {
            clientId: this.getClientId(),
        },
    },
    '*',
    [port], // MessagePort object
);
```

If the devtools are installed, `src/scripts/main.ts` will receive this message and run a callback.

## Development Status

### What I'm figuring out

- What features should be included in the devtools?
- Is Vite + the CRXJS plugin reasonable for production? Are there alternatives?
- Is it worth using React/another SPA framework for the frontend?
- Is it worth creating (relatively) complex classes (eg. PortConnectionManager) for this?
- What modifications need to be made to the SDK(s)?

### What I need feedback on

- How do the devtools feel to use?
- Are there any bugs (except the ConnectionStatus being broken)? How can one reproduce them?
- Is the project well-structured, or is it overly complex?

### What I'm getting stuck on (assistance needed)

- How can I obtain the current sync status with only an `AsyncDatabaseConnection`?
