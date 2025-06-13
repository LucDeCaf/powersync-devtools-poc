chrome.devtools.panels.create('Panel title', null, 'panel.html', (panel) => {
    console.log("It's working! (maybe)");
    console.log(panel);
});
