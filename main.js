const { app, BrowserWindow, Menu } = require('electron');
const fs = require('fs');

const menuFactroy = require('./menus/menuFactory');

var i18next = require("i18next");
var Backend = require("i18next-node-fs-backend");
const i18nextOptions = require("./i18nextOptions");


var currentSettings  = fs.readFileSync('./settings.json');
currentSettings = JSON.parse(currentSettings);
// set the language and load
if ( currentSettings.language !== void 0) {
    i18nextOptions.setLanguage(currentSettings.language);
}
i18next.use(Backend).init(i18nextOptions.getOptions());

let mainWindow;

function createMainWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
        nodeIntegration: true
        }
    });

    // and load the index.html of the app.
    mainWindow.loadFile('./components/main/main.html');

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Insert menu
    i18next.on('languageChanged', () => {
        Menu.setApplicationMenu(menuFactroy(app, mainWindow, i18next));
    });
}

app.on('ready', createMainWindow);
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});



// Add developer tools item if not in production
// if(process.env.NODE_ENV !== 'production'){
//     mainMenuTemplate.push({
//         label: "Developer Tools",
//         submenu: [
//             {
//                 label: "Toggle DevTools",
//                 accelerator: "CommandOrControl+I",
//                 click(item, focusedWindow){
//                     focusedWindow.toggleDevTools();        
//                 }
//             },
//             {
//                 role: 'reload'
//             }
//         ]
//     });
// }