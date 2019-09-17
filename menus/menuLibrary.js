const { dialog } = require('electron');
const fs = require('fs');
const path = require('path');


const loadFile = require('../components/loadFile/loadFile');
const settings = require('../components/settings/settings');
const dialogBuilder = require('../components/dialogBuilder/dialogBuilder');

// TODO -- add translation to all string messages for all function

const menuLibrary = {

    theApp: {},
    theWindow: {},
    theLanguage: {},

    initialize: function(app, translation, mainWindow)
    {
        this.theApp = app;
        this.theWindow = mainWindow;
        this.theLanguage = translation;
    },

    mainAppLoadData: function(name)
    {
        return {
            label : menuLibrary.theLanguage.t(name),
            accelerator: "CommandOrControl+L",
            click(){
                dialog.showOpenDialog(menuLibrary.theWindow, {title: menuLibrary.theLanguage.t("Load data"), filters: [{name: 'Comma-separated values', extensions: ['csv']}], properties: ['openFile']}, result => {
                    if (result !== void 0 && result.length > 0) {            
                        let filePath = result.pop();    
                        // check if the file exists and we can read from it                                            
                        fs.access(filePath, fs.constants.F_OK | fs.constants.R_OK, (err) => {
                            if (err) {
                                dialog.showMessageBox(menuLibrary.theWindow, {type: 'error', title: menuLibrary.theLanguage.t('Could not open the file!'), buttons: ['OK']});
                            } else {
                                // pass menuLibrary.theWindow for dialog messages
                                loadFile.import(filePath, menuLibrary.theWindow);
                            }
                        });
                    }
                });
            }
        };
    },
    
    mainAppSettings: function(name)
    {
        return {
            label : menuLibrary.theLanguage.t(name),
            click(){
                settings.createSettingsWindow(menuLibrary.theLanguage, menuLibrary.theWindow);
            }
        };
    },
    
    mainAppExist: function(name) 
    {
        return {
            label : menuLibrary.theLanguage.t(name),
            accelerator: "CommandOrControl+Q",
            click(){
                menuLibrary.theApp.quit();
            }
        };
    },

    menuForDialog: function(dialogID, dialogName)
    {
        return {
            label : menuLibrary.theLanguage.t(dialogName),
            click(){
                fs.readFile(path.resolve('./dialogs/' + dialogID + '.json'), 'UTF8', (err, data) => {
                    if ( err ) {
                        dialog.showMessageBox(menuLibrary.theWindow, {type: "info", message: menuLibrary.theLanguage.t("No functionality for this item!"), title: menuLibrary.theLanguage.t("Error"), buttons: ["OK"]});
                    } else {
                       dialogBuilder.build(data, menuLibrary.theWindow);
                    }
                });
            }
        };
    },

    // Testing purpose only
    // mainAppSwitchLanguage: function(name)
    // {
    //     return {
    //         // Just playing around
    //         label : menuLibrary.theLanguage.t(name),
    //         click(){
    //             let newLang = 'ro';
    //             if(menuLibrary.theLanguage.language == 'ro') {
    //                 newLang = 'en';
    //             } else if (menuLibrary.theLanguage.language == 'en') {
    //                 newLang = 'ro';
    //             }
    //             menuLibrary.theLanguage.changeLanguage(newLang, (err, t) => {
    //                 if (err) { console.log('something went wrong loading', err); }
    //             });                          
    //         }
    //     };
    // },
    
    // System -------------------------------------------------
    mainAppUndo: function(name)
    {
        return { label: menuLibrary.theLanguage.t(name), accelerator: "CmdOrCtrl+Z", selector: "undo:" };
    },
    mainAppRedo: function(name)
    {
        return { label: menuLibrary.theLanguage.t(name), accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" };
    },
    mainAppCut: function(name)
    {
        return { label: menuLibrary.theLanguage.t(name), accelerator: "CmdOrCtrl+X", selector: "cut:" };
    },
    mainAppCopy: function(name)
    {
        return { label: menuLibrary.theLanguage.t(name), accelerator: "CmdOrCtrl+C", selector: "copy:" };
    },
    mainAppPaste: function(name)
    {
        return { label: menuLibrary.theLanguage.t(name), accelerator: "CmdOrCtrl+V", selector: "paste:" };
    },
    mainAppSelectAll: function(name)
    {
        return { label: menuLibrary.theLanguage.t(name), accelerator: "CmdOrCtrl+A", selector: "selectAll:" };
    },
    separator: function(name)
    {
        return { type: 'separator' };
    },
};

module.exports = menuLibrary;