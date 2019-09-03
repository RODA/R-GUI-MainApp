const { dialog, BrowserWindow } = require('electron');
const fs = require('fs');

let settingsWindow;

const settings = {
    all: {},
    createSettingsWindow: function(parentWindow = null){
        
        // Create the browser window.
        settingsWindow = new BrowserWindow({
            width: 640,
            height: 480,
            parent: parentWindow,
            webPreferences: {
                nodeIntegration: true
            }
        });
        // and load the settings.html of the app.
        settingsWindow.loadFile('./settings.html');

            // Emitted when the window is closed.
        settingsWindow.on('closed', () => {
            settingsWindow = null;
        });
        // no menu
        settingsWindow.setMenu(null);
    },
    // load the settings
    readSettingsFile: function()
    {
        fs.readFile('/settings.json', function rs(err, data){
            if (err) {
                console.log('Error opening settings file'. err);
            }
            else {
                settings.all = JSON.parse(data);
            }
        });
    }
};

module.exports = settings;