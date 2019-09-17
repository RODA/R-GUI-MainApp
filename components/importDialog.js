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
            let dialogPath = path.resolve('dialogs/' + dialogName + '.json');
            let dialogExists = false;

            // check if the file exist sync    
            try {
                fs.accessSync(dialogPath, fs.constants.R_OK | fs.constants.W_OK);
                dialogExists = true;
            } catch (err) {
                dialogExists = false;
            }

            if (dialogExists) {
                // If a dialog with the same name exist, ask to override it
                let question = dialog.showMessageBoxSync(mWindow, {type: "question", message: "A dialog with the same name already exists! Would you like to override it?", title: "Already exists", buttons: ["No", "Yes"]});
                if (question === 1) {
                    fs.open(dialogPath, 'w', (err, fd) => {
                        if (err) {
                            dialog.showMessageBox(mWindow, {type: "error", message: "Could not import dialog! Error open!", title: "Error", buttons: ["OK"]});
                        } else {
                            fs.writeFile(fd, data, (err) => {
                                if (err) {
                                    dialog.showMessageBox(mWindow, {type: "error", message: "Could not import file! Error write!", title: "Error", buttons: ["OK"]});
                                } else {
                                    dialog.showMessageBox(mWindow, {type: "info", message: "Dialog imported successfully!", title: "Success", buttons: ["OK"]});
                                }
                            });
                        }
                    });
                }
            } else {
                // import dialog
                fs.open(dialogPath, 'wx', (err, fd) => {
                    if (err) {
                        dialog.showMessageBox(mWindow, {type: "error", message: "Could not import dialog! Error open non exist!", title: "Error", buttons: ["OK"]});
                    } else {
                        fs.writeFile(fd, data, (err) => {
                            if (err) {
                                dialog.showMessageBox(mWindow, {type: "error", message: "Could not import file! Error write non exist!", title: "Error", buttons: ["OK"]});
                            } else {
                                dialog.showMessageBox(mWindow, {type: "info", message: "Dialog imported successfully!", title: "Success", buttons: ["OK"]});
                            }
                        });
                    }
                });
            }
        }
    },
};

module.exports = importDialog;