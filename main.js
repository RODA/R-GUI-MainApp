const { app, BrowserWindow, Menu } = require('electron');
const os = require('os');
const fs = require('fs');
const path = require('path');

const menuFactroy = require('./menus/menuFactory');
const i18next = require("i18next");
const Backend = require("i18next-node-fs-backend");
const i18nextOptions = require("./i18nextOptions");
const logging = require('./libraries/logging');

// Setting ENVIROMENT
process.env.NODE_ENV = 'development';

// the settings object - to be passed around - add here other properties
let theSettings = {
  language: 'en',
  languageNS: 'en_US',
  workingDirectory: os.homedir()
};

// loading language from settings
let settingsFileData  = fs.readFileSync(path.resolve('./settings.json'), 'utf8');
try{
  settingsFileData = JSON.parse(settingsFileData);
}
catch (error){
  logging.error('Reading settings - ' + error);
}
// set the language and load
if ( settingsFileData.defaultLanguage !== void 0) {
    // get only the en of the eu_US part
    let lang = settingsFileData.defaultLanguage.split('_');
    // update date from the settings file
    theSettings.language = lang[0];
    theSettings.languageNS = settingsFileData.defaultLanguage;
}

i18nextOptions.setLanguage(theSettings.language, theSettings.languageNS);
i18next.use(Backend).init(i18nextOptions.getOptions(process.env.NODE_ENV, true));
//---------------------------------------

let mainWindow;

function createMainWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
      title: 'R-GUI-MainApp',
      width: 800,
      minWidth: 800,
      height: 600,
      minHeight: 600,
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
    mainWindow.maximize();

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Insert menu after language has loaded
    i18next.on('languageChanged', () => {
        Menu.setApplicationMenu(menuFactroy(app, mainWindow, i18next, theSettings));
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



