const { ipcRenderer } = require('electron');
const Split = require('split.js');
const comm = require('../../libraries/communication');


ipcRenderer.on('initializeApp', (event, args) => {
    // resize terminal according to window size
    comm.resizeTerm();    
    // check for R packages dependencies
    comm.checkForRPackages(args); 
});

Split(['#command', '#xterm'], {
    elementStyle: (dimension, size, gutterSize) => ({
        'flex-basis': `calc(${size}% - ${gutterSize}px)`,
    }),
    gutterStyle: (dimension, gutterSize) => ({
        'flex-basis':  `${gutterSize}px`,
    }),
    direction: 'vertical',
    sizes: [15, 85],
    minSize: [100, 200],
    onDragEnd: () => {       
        comm.resizeTerm();   
    }
});

ipcRenderer.on('openFile', (event, args) => {

});

// change working directory from menu
ipcRenderer.on('changeWorkingDirectory', (event, args) => {    
    comm.setWorkingDirectory(args);    
});

// show current dialog command | update HTML element
ipcRenderer.on('commandSyntax', (event, args) => {
    document.getElementById('command').innerHTML = args;
});