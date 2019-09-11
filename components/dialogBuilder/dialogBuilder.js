const { dialog, BrowserWindow } = require('electron');

let windowsList = {};

const dialogBuilder = {
    
    build: function(data, parentWindow)
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
                dialogData
            );
        }
    },

    makeTheWindow: function(name, width, height, parentWindow, allData)
    {

        if (windowsList[name] !== void 0) {
            windowsList[name].focus();
        } else {
            let theWindow;
            theWindow = new BrowserWindow({
                width: width + 30,
                height: height + 50,
                title: name,
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
                console.log('show');
                
                theWindow.webContents.send('dialogCreated', allData);
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