const { ipcRenderer } = require('electron');
const Split = require('split.js');
const comm = require('../../libraries/communication');


ipcRenderer.on('initializeApp', (event, args) => {
    // resize terminal according to window size
    comm.resizeTerm();    
    // check for R packages dependencies
    comm.initiateCommunication(args); 
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

ipcRenderer.on('ptyData', (event, args) => {
    comm.processData(args);
});

// change working directory from menu
// ipcRenderer.on('runRCommandInvisible', (event, args) => {    
//     comm.setWorkingDirectory(args);    
// });



// show current dialog command | update HTML element
ipcRenderer.on('commandSyntax', (event, args) => {
    document.getElementById('command').innerHTML = args;
});

// dialog send initial data
ipcRenderer.on('dialogCreated', (event, args) => {
    let data = comm.getCurrentData();
    ipcRenderer.send('dialogInitialData', {name: args.name, data: data});
});
// run a R commmand from a dialog
ipcRenderer.on('runCommand', (event, args) => {
    comm.runRCommand(args);
});
// run a R commmand from system | invisible
ipcRenderer.on('runCommandInvisible', (event, args) => {
    comm.runRCommandInvisible(args);
});