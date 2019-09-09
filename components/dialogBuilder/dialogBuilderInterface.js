const { ipcRenderer } = require('electron');
const objects = require("../../libraries/objects");

ipcRenderer.on('dialogCreated', (event, args) => 
{
    // console.log(args);
    // console.log('emilian');
    
    objects.makeDialog(args);
});