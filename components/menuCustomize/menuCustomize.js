const { dialog, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

const { defaultMenu, systemElements } = require('../../menus/menuObjects');

let menuCustomizeWindow;

const menuCustomize = {
    
    theWindow: {},

    start: function(mWindow){

        this.theWindow = mWindow;

        if (menuCustomizeWindow !== void 0 && menuCustomizeWindow !== null) {
            menuCustomizeWindow.focus();
        } else {
            menuCustomizeWindow = new BrowserWindow({
                width: 800,
                height: 600,
                title: 'Customize the menu',
                parent: mWindow,
                webPreferences: {
                    nodeIntegration: true
                },
                resizable: false,
                show: false,
            });

            // Open the DevTools.
            menuCustomizeWindow.webContents.openDevTools();

            // and load the menuCustomize.html of the app.
            menuCustomizeWindow.loadFile('./components/menuCustomize/menuCustomize.html');

                // Emitted when the window is closed.
            menuCustomizeWindow.on('closed', () => {
                menuCustomizeWindow = null;
            });
                    
            // when data is ready show window
            menuCustomizeWindow.once("show", () => {
                let dialogList = this.getAvailableDialogs();
                let currentMenu = this.getCurrentMenu();
                
                let newList = [...systemElements];
                for (let i = 0; i < dialogList.length; i++) {
                    newList.push(dialogList[i]);
                }
                menuCustomizeWindow.webContents.send('elementsList', {'newItemList': newList, 'currentMenu': currentMenu});

            });
            // when window is ready send data
            menuCustomizeWindow.once("ready-to-show", () => {
                menuCustomizeWindow.show();
            });
            // no menu
            menuCustomizeWindow.setMenu(null);
        }
    },
    // get dialogs from the dialogs folder
    getAvailableDialogs: function()
    {
        let data = fs.readFileSync(path.resolve('./menus/menuDialogList.json'), 'UTF8');
        try{
            // return data
            return JSON.parse(data);
        }catch(error){
            return [];
        }
    },
    // get current menu
    getCurrentMenu: function()
    {
        let data = fs.readFileSync(path.resolve('./menus/menu.json'), 'UTF8');
        try{
            // return data
            return JSON.parse(data);
        }catch(error){
            return [];
        }
    },

    // TODO
    // reset menu to default
    resetMenuToDefault: function()
    {
        let question = dialog.showMessageBoxSync(this.theWindow, {type: "question", message: "Are you sure you sure ? This operation cannot be undone!", title: "Reset menu to default", buttons: ["No", "Yes"]});
        if (question === 1) {

        }
    },
    // rebuild the available dialog list
    reduildAvailableDialogList: function()
    {
        let question = dialog.showMessageBoxSync(this.theWindow, {type: "question", message: "Are you sure you want to update the dialog list?", title: "Update available dialog list", buttons: ["No", "Yes"]});
        if (question === 1) {
            let dialogList = [];
            fs.readdir(path.resolve('./dialogs'), (err, files) => {
                if(err){
                    console.log('Error reading the dialogs folder' + err);
                } else {
                    for (let i = 0; i< files.length; i++) 
                    {    
                        let dialog;
                        let data = fs.readFileSync(path.resolve('./dialogs/' + files[i]), 'UTF8');
                        
                        try{
                            dialog = JSON.parse(data);
                        }catch(error){
                            console.log('Could not parse dialog. ' + err);
                            dialog = null;
                        }
                        if (dialog !== void 0 && dialog !== null) {
                            let dialogFileName = files[i].substring(0, files[i].length - 5);
                            dialogList.push({
                                "id": dialogFileName,
                                "name": dialog.properties.title,
                                "type": "dialog"
                            });
                        }               
                    }
                    fs.open(path.resolve('./menus/menuDialogList.json'), 'w', (err, fd) => {
                        if (err) {
                            console.log('Could not open the menuDialogList for writing' + err);
                        } else {
                            fs.writeFile(fd, JSON.stringify(dialogList), (err) => {
                                if (err) {
                                    dialog.showMessageBox(this.theWindow, {type: "error", message: "Could not update the available dialog list", title: "Error", buttons: ["OK"]});
                                } else {
                                    dialog.showMessageBox(this.theWindow, {type: "info", message: "Dialog list updated successfully!", title: "Success", buttons: ["OK"]});
                                }
                            });
                        }
                    });
                }
            });
        }
    }
};

ipcMain.on('rebuildDialogList', (event, args) => {
    menuCustomize.reduildAvailableDialogList();
});

ipcMain.on('resetMenuToDefault', (event, args) => {
    menuCustomize.resetMenuToDefault();
});


module.exports = menuCustomize;