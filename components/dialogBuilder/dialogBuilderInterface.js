const { ipcRenderer } = require('electron');
const objects = require("../../libraries/objects");

// build the dialog after the window was created
ipcRenderer.on('dialogCreated', (event, args) => 
{
    // create the dialog
    objects.makeDialog(args.dialogID, args.data);

    // update to last state if opened previously
    if(args.lastState) {
        objects.changeDialogState(args.lastState, true);
    }
});

// load data received from R
ipcRenderer.on('dataFromR', (event, args) => {
    objects.incommingDataFromR(args);
});