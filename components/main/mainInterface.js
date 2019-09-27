const comm = require('../../libraries/communication');
const { ipcRenderer } = require('electron');
const Split = require('split.js');



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
        console.log('resizing...');
        
        comm.resizeTerm();   
    }
});

// Split.onDragEnd();

ipcRenderer.on('openFile', (event, args) => {

});


ipcRenderer.on('changeWorkingDirectory', (event, args) => {
    comm.setWorkingDirectory(args);    
});