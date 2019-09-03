const { ipcRenderer } = require('electron');

ipcRenderer.on('openFile', (event, args) => {

    document.getElementById("hello").innerHTML = args;
});