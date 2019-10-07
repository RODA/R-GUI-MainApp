const { dialog, BrowserWindow } = require('electron');

let windowsList = {};

const dialogBuilder = {
    
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

    makeTheWindow: function(name, windowWidth, windowHeight, parentWindow, allData, lastState, dialogID)
    {      

        if (windowsList[name] !== void 0 && windowsList[name] !== null && !windowsList[name].isDestroyed()) {           
            windowsList[name].focus();
        } else {
            let theWindow;
            theWindow = new BrowserWindow({
                // x: 10,
                // y: 10,
                width: parseInt(windowWidth) + 40,
                height: parseInt(windowHeight) + 50,
                title: name,
                resizable: false,
                parent: parentWindow,
                webPreferences: {
                    nodeIntegration: true
                },
                // resizable: false,
                show: false,
            });

            // Open the DevTools.
            theWindow.webContents.openDevTools();
                    
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
            
            windowsList[name] = theWindow;
        }
    },
};

module.exports = dialogBuilder;