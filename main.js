const { app, BrowserWindow, Menu } = require('electron');
const fs = require('fs');
const path = require('path');

const menuFactroy = require('./menus/menuFactory');
const i18next = require("i18next");
const Backend = require("i18next-node-fs-backend");
const i18nextOptions = require("./i18nextOptions");

// Setting ENVIROMENT
process.env.NODE_ENV = 'development';

// loading language from settings
var currentSettings  = fs.readFileSync('./settings.json');
currentSettings = JSON.parse(currentSettings);
// set the language and load
if ( currentSettings.defaultLanguage !== void 0) {
    // get only the en of the eu-US part
    let lang = currentSettings.defaultLanguage.split('-');
    i18nextOptions.setLanguage(lang[0], currentSettings.defaultLanguage);
}
i18next.use(Backend).init(i18nextOptions.getOptions(process.env.NODE_ENV));
//---------------------------------------

let mainWindow;

function createMainWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      title: 'R-GUI-MainApp',
      width: 800,
      height: 600,
      center: true,
      webPreferences: {
        nodeIntegration: true
      }
    });

    // and load the index.html of the app.
    mainWindow.loadFile('./components/main/main.html');

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    // maximize
    // mainWindow.maximize();

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Insert menu after language has loaded
    i18next.on('languageChanged', () => {
      let menu = menuFactroy(app, mainWindow, i18next);
      if (menu) {
        Menu.setApplicationMenu(menuFactroy(app, mainWindow, i18next));
      }
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
  if (mainWindow === null) {
    createMainWindow();
  }
});



