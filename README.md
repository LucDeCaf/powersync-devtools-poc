# PowerSync Devtools (PoC)

Proof of concept for Powersync devtools to see:

1. How devtools might look/function
2. How messages would be sent between a Powersync client and devtools
3. What needs to be added to `@powersync/web` to facilitate devtools

## Modifications to `@powersync/web`:

-   `src/db/PowerSyncDatabase.ts`: Modify PowerSyncDatabase constructor to include `document.dispatchEvent` and `document.addEventListener` calls to know if/when/where to send data such that the extension can access it

## Future plans

-   Types
-   Build pipeline
