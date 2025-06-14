document.addEventListener('DOMContentLoaded', () => main());

async function main() {
    const result = await executeScript('./getIndexedDB.js');
    if (result.success) {
        console.log('IndexedDB database IDs: ', result.databases);
    } else {
        console.log('Error: ' + result.error);
    }
}

async function executeScript(script) {
    const { result } = (
        await chrome.scripting.executeScript({
            target: { tabId: chrome.devtools.inspectedWindow.tabId },
            files: [script],
        })
    )[0];
    return result;
}
