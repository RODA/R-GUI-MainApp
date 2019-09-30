const { ipcRenderer } = require('electron');
const Split = require('split.js');

var comm; 

ipcRenderer.on('initializeApp', (event, args) => {
    // load communication library
    comm = require('../../libraries/communication');
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

// Split.onDragEnd();

ipcRenderer.on('openFile', (event, args) => {

});



// change working directory from menu
ipcRenderer.on('changeWorkingDirectory', (event, args) => {    
    comm.setWorkingDirectory(args);    
});