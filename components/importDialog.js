const fs = require('fs');
const path = require('path');
const { dialog } = require('electron');

const importDialog = {
    
    //save the dialog
    save: function(data, mWindow)
    {
        let dialogData;
        try {
            dialogData = JSON.parse(data);
        } catch (err) {
            dialog.showMessageBox(mWindow, {type: "error", message: "Could not open the file!", title: "Error", buttons: ["OK"]});
        }
        if (dialogData !== void 0 && dialogData.properties.name !== void 0) {
            let dialogName = dialogData.properties.name.toLowerCase().replace(' ', '-');
        
            fs.open(path.resolve('dialogs/' + dialogName + '.json'), 'wx', (err, fd) => {
                if (err) {
                    dialog.showMessageBox(mWindow, {type: "error", message: "Could not import dialog. A dialog with the same name already exists!", title: "Error", buttons: ["OK"]});
                } else {
                    fs.writeFile(fd, data, (err) => {
                        if (err) {
                            dialog.showMessageBox(mWindow, {type: "error", message: "Could not import file!", title: "Error", buttons: ["OK"]});
                        } else {
                            dialog.showMessageBox(mWindow, {type: "info", message: "Dialog imported successfully!", title: "Success", buttons: ["OK"]});
                        }
                    });
                }
            });

        }
    },
};

module.exports = importDialog;