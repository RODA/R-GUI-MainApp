const comm = require('../../libraries/communication');
const { ipcRenderer } = require('electron');
const Split = require('split.js');



Split(['#command', '#terminal'], {
    elementStyle: (dimension, size, gutterSize) => ({
        'flex-basis': `calc(${size}% - ${gutterSize}px)`,
    }),
    gutterStyle: (dimension, gutterSize) => ({
        'flex-basis':  `${gutterSize}px`,
    }),
    direction: 'vertical',
    sizes: [25, 75],
});

ipcRenderer.on('openFile', (event, args) => {

});


ipcRenderer.on('changeWorkingDirectory', (event, args) => {
    comm.setWorkingDirectory(args);    
});