const { dialog } = require('electron');
const fs = require('fs');
const settings = require('../components/settings/settings');
const importDialog = require('../components/importDialog');

module.exports = (app, mainWindow, i18next) => {
    
    let mainMenuTemplate = 
    [
        {
            label: i18next.t('&File'),
            submenu:[
                {
                    label: 'Load Data',
                    accelerator: "CommandOrControl+L",
                    click(){
                        // mainWindow.webContents.send('newClick');
                    }
                },
                {
                    label: 'Change to RO testing',
                    accelerator: "CommandOrControl+P",
                    click(){
                        i18next.changeLanguage('ro', (err, t) => {
                            if (err) { console.log('something went wrong loading', err); }
                        });                        
                    }
                },
                { type: "separator"},
                {
                    label: i18next.t("Import dialog"),
                    accelerator: "CommandOrControl+O",
                    click(){
                        dialog.showOpenDialog(mainWindow, {title: "Load dialog data", filters: [{name: 'R-GUI-DialogCreator', extensions: ['dat']}], properties: ['openFile']}, result => {
                            if (result !== void 0) {                            
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
                        // createAboutWindow();
                    }
                }
            ]
        },
    ];
    return mainMenuTemplate;
};