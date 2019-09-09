const { dialog } = require('electron');
const fs = require('fs');
const settings = require('../components/settings/settings');
const importDialog = require('../components/importDialog');
const loadData = require('../components/loadData/loadData');
const mainMenuObj = require('./mainMenuObj');

module.exports = (app, mainWindow, i18next) => {
    
    let mainMenuTemplate = 
    [
        {
            label: i18next.t('&File'),
            submenu:[
                {   
                    //TODO -- create dialog and than load file
                    label: 'Load Data',
                    accelerator: "CommandOrControl+L",
                    click(){
                        dialog.showOpenDialog(mainWindow, {title: "Load data", filters: [{name: 'Comma-separated values', extensions: ['csv']}], properties: ['openFile']}, result => {
                            if (result !== void 0 && result.length > 0) {            
                                let filePath = result.pop();    
                                // check if the file exists and we can read from it                                            
                                fs.access(filePath, fs.constants.F_OK | fs.constants.R_OK, (err) => {
                                    if (err) {
                                        dialog.showMessageBox(mainWindow, {type: 'error', title: 'Could not open the file!', buttons: ['OK']});
                                    } else {
                                        // pass mainWindow for dialog messages
                                        loadData.import(filePath, mainWindow);
                                    }
                                });
                            }
                        });
                    }
                },
                { type: "separator"},
                {
                    label: i18next.t("Import dialog"),
                    accelerator: "CommandOrControl+O",
                    click(){
                        dialog.showOpenDialog(mainWindow, {title: "Import dialog", filters: [{name: 'R-GUI-DialogCreator', extensions: ['dat']}], properties: ['openFile']}, result => {
                            if (result !== void 0 && result.length > 0) {                            
                                fs.readFile(result[0], 'utf-8', (err, data) => {
                                    if (err) {
                                        dialog.showMessageBox(mainWindow, {type: 'error', title: 'Could not open the file!', buttons: ['OK']});
                                    } else {
                                        // pass mainWindow for dialog messages
                                        importDialog.save(data, mainWindow);
                                    }
                                });
                            }
                        });
                    }
                },
                { type: "separator"},
                {
                    label: 'Exit',
                    accelerator: "CommandOrControl+Q",
                    click(){
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Edit',
            submenu:[
                { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
                { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
                { type: "separator" },
                { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
                { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
                { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
                { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" },
                { type: "separator" },
                {
                    label: i18next.t('Settings'),
                    accelerator: "CommandOrControl+S",
                    click(){
                        settings.createSettingsWindow(mainWindow);
                    }
                },
            ]
        },
        {
            label: 'Info',
            submenu:[
                {
                    label: 'About',
                    click(){
                        console.log(JSON.stringify(mainMenuObj));
                    }
                },
                {
                    // Just playing around
                    label: 'Switch language',
                    click(){
                        let newLang = 'ro';
                        if(i18next.language == 'ro') {
                            newLang = 'en';
                        } else if (i18next.language == 'en') {
                            newLang = 'ro';
                        }
                        i18next.changeLanguage(newLang, (err, t) => {
                            if (err) { console.log('something went wrong loading', err); }
                        });          
                        
                    }
                },
            ]
        },
    ];
    return mainMenuTemplate;
};