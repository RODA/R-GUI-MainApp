const { dialog, BrowserWindow } = require('electron');
const { ipcMain } = require('electron');

const fs = require('fs');
const path = require('path');

let settingsWindow;

// TODO -- add translation
const settings = {
    // used later fot saving
    settingsData: {},

    createSettingsWindow: function(theLanguage, theWindow) 
    {    
        fs.readFile(path.resolve('./settings.json'), function rs(err, data){
            if (err) {
                dialog.showMessageBox(theWindow, {type: "error", message: theLanguage.t("An error occured we can not open the settings window!"), title: theLanguage.t("Error"), buttons: ["OK"]});
            }
            else {
                let settingsData;
                try {
                    settings.settingsData = JSON.parse(data);
                } catch (error) {
                    dialog.showMessageBox(theWindow, {type: "error", message: theLanguage.t("An error occured we can not open the settings window!"), title: theLanguage.t("Error"), buttons: ["OK"]});
                    return;
                }

                // Create the browser window.
                settingsWindow = new BrowserWindow({
                    width: 640,
                    height: 480,
                    title: theLanguage.t('Settings'),
                    // parent: theWindow,
                    // modal: true,
                    webPreferences: {
                        nodeIntegration: true
                    },
                    resizable: false,
                    show: false,
                });
                
                // Open the DevTools.
                settingsWindow.webContents.openDevTools();
                
                // and load the settings.html of the app.
                settingsWindow.loadFile('./components/settings/settings.html');

                    // Emitted when the window is closed.
                settingsWindow.on('closed', () => {
                    settingsWindow = null;
                });
                
            
                // when data is ready show window
                settingsWindow.once("show", () => {
                    settingsWindow.webContents.send('settingsLoaded', settings.settingsData);
                });
                // when window is ready send data
                settingsWindow.once("ready-to-show", () => {
                    settingsWindow.show();
                });

                settingsWindow.setMenu(null);
            }
        });  
    },

    saveSettings: function(data)
    {
        for(let key in data) {
            if ( settings.settingsData[key] ) {
                settings.settingsData[key] = data[key];
            }
        }

        fs.open(path.resolve('./settings.json'), 'w', (err, fd) => {
            if (err) { 
                dialog.showMessageBox(theWindow, {type: "error", message: theLanguage.t("An error occured while trying to save the settings!"), title: theLanguage.t("Error"), buttons: ["OK"]});
            } else {
                fs.writeFile(fd, JSON.stringify(settings.settingsData), 'utf8', (err) => {
                    if (err) { 
                        dialog.showMessageBox(theWindow, {type: "error", message: theLanguage.t("An error occured while trying to save the settings!"), title: theLanguage.t("Error"), buttons: ["OK"]});
                    } else {
                        settingsWindow.webContents.send('settingsSaved');
                    }
                });
            }
        });
    },

    // cancel settings
    closeWindow: function()
    {
        
    }
};

ipcMain.on('saveSettings', (event, args) => {
    settings.saveSettings(args);
});


module.exports = settings;