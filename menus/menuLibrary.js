const { dialog } = require('electron');
const fs = require('fs');
const path = require('path');
const upath = require("upath");


const loadFile = require('../components/importFromFile/importFromFile');
const settings = require('../components/settings/settings');
const dialogBuilder = require('../components/dialogBuilder/dialogBuilder');

// TODO -- add translation to all string messages for all function

const menuLibrary = {

    theApp: {},
    theWindow: {},
    i18next: {},
    theSettings: {},

    initialize: function(theApp, i18next, mainWindow, theSettings)
    {
        this.theApp = theApp;
        this.theWindow = mainWindow;
        this.i18next = i18next;
        this.theSettings = theSettings;
    },

    // import data from file
    mainAppImportFromFile: function(name)
    {
        return {
            label : menuLibrary.i18next.t(name),
            accelerator: "CommandOrControl+L",
            click(){
                loadFile.createLoadFileWindow(menuLibrary.i18next, menuLibrary.theWindow, menuLibrary.theSettings);
            }
        };
    },
    
    // change R working directory
    mainAppChangeWD: function(name)
    {
        return {
            label : menuLibrary.i18next.t(name),
            click(){
                
                dialog.showOpenDialog(menuLibrary.theWindow, {title: menuLibrary.i18next.t('Select directory'), defaultPath: menuLibrary.theSettings.workingDirectory, properties: ['openDirectory']}, function getSelectedDirectoy(result){
                    menuLibrary.theWindow.webContents.send('changeWorkingDirectory', upath.normalize(result[0]));
                });
            }
        };
    },

    // open the settings dialog
    mainAppSettings: function(name)
    {
        return {
            label : menuLibrary.i18next.t(name),
            click(){
                settings.createSettingsWindow(menuLibrary.i18next, menuLibrary.theWindow, menuLibrary.theSettings);
            }
        };
    },
    
    // quit the application
    mainAppExist: function(name) 
    {
        return {
            label : menuLibrary.i18next.t(name),
            accelerator: "CommandOrControl+Q",
            click(){
                menuLibrary.theApp.quit();
            }
        };
    },

    // create a dialog
    menuForDialog: function(dialogID, dialogName)
    {
        return {
            label : menuLibrary.i18next.t(dialogName),
            click(){
                fs.readFile(path.resolve('./dialogs/' + dialogID + '.json'), 'UTF8', (err, data) => {
                    if ( err ) {
                        dialog.showMessageBox(menuLibrary.theWindow, {type: "info", message: menuLibrary.i18next.t("No functionality for this item!"), title: menuLibrary.i18next.t("Error"), buttons: ["OK"]});
                    } else {
                        let lastState = menuLibrary.theSettings.dialogs[dialogID] ? menuLibrary.theSettings.dialogs[dialogID] : null;
                        
                        dialogBuilder.build(dialogID, data, menuLibrary.theWindow, lastState);                      
                    }
                });
            }
        };
    },
    
    // System -------------------------------------------------
    mainAppUndo: function(name)
    {
        return { label: menuLibrary.i18next.t(name), accelerator: "CmdOrCtrl+Z", selector: "undo:" };
    },
    mainAppRedo: function(name)
    {
        return { label: menuLibrary.i18next.t(name), accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" };
    },
    mainAppCut: function(name)
    {
        return { label: menuLibrary.i18next.t(name), accelerator: "CmdOrCtrl+X", selector: "cut:" };
    },
    mainAppCopy: function(name)
    {
        return { label: menuLibrary.i18next.t(name), accelerator: "CmdOrCtrl+C", selector: "copy:" };
    },
    mainAppPaste: function(name)
    {
        return { label: menuLibrary.i18next.t(name), accelerator: "CmdOrCtrl+V", selector: "paste:" };
    },
    mainAppSelectAll: function(name)
    {
        return { label: menuLibrary.i18next.t(name), accelerator: "CmdOrCtrl+A", selector: "selectAll:" };
    },
    separator: function(name)
    {
        return { type: 'separator' };
    },
};

module.exports = menuLibrary;