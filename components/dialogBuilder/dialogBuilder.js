const { dialog, BrowserWindow, ipcMain } = require('electron');

// the list of windows / dialogs
let windowsList = {};

const dialogBuilder = {
    // get data from menu builder and try to create the window
    build: function(dialogID, data, parentWindow, lastState)
    {
        let dialogData;
        try {
            dialogData = JSON.parse(data);
        }
        catch (error) {
            // show message and return
            dialog.showMessageBox(parentWindow, {type: "error", message: "Dialog data error!", title: "Error", buttons: ["OK"]});
            return;
        }
        // we have the dialog data try to make the window
        if (dialogData !== void 0) {
            this.makeTheWindow(
                dialogData.properties.title,
                dialogData.properties.width,
                dialogData.properties.height,
                parentWindow,
                dialogData, 
                lastState,
                dialogID
            );
        }
    },

    // make the if not already build
    // alldata - for objects
    // lastState - if was already opened
    // dialogID - the file name - used for saving the state
    makeTheWindow: function(name, windowWidth, windowHeight, parentWindow, allData, lastState, dialogID)
    {      

        if (windowsList[name] !== void 0 && windowsList[name] !== null && !windowsList[name].isDestroyed()) {           
            windowsList[name].focus();
        } else {
            let theWindow;
            theWindow = new BrowserWindow({
                width: parseInt(windowWidth) + 40,
                height: parseInt(windowHeight) + 50,
                title: name,
                resizable: false,
                parent: parentWindow,
                webPreferences: {
                    nodeIntegration: true
                },
                show: false,
            });

            // Open the DevTools.
            // theWindow.webContents.openDevTools();
                    
            // and load the settings.html of the app.
            theWindow.loadFile('./components/dialogBuilder/dialogBuilder.html');

                // Emitted when the window is closed.
            theWindow.on('closed', () => {
                theWindow = null;
            });
            
            // when data is ready show window
            theWindow.once("show", () => {
                theWindow.webContents.send('dialogCreated', {'dialogID': dialogID, 'data': allData, 'lastState': lastState});
            });
            // when window is ready send data
            theWindow.once("ready-to-show", () => {
                theWindow.show();
            });

            theWindow.setMenu(null);
            
            windowsList[dialogID] = theWindow;
        }
    },
};

// populate window with existing data
ipcMain.on('dialogInitialData', (event, args) =>
{
    if (windowsList[args.name]) {
        windowsList[args.name].webContents.send('dialogInitialData', args.data);
    }
});

// announce all windows that we have data
ipcMain.on('dialogDataUpdate', (event, args) => 
{
    for (let win in windowsList) {
        if(!windowsList[win].isDestroyed()) {
            windowsList[win].webContents.send('dataUpdateFromR', args);
        }
    }
});

module.exports = dialogBuilder;