const { app, BrowserWindow, Menu, dialog, ipcMain } = require('electron');
const os = require('os');
const fs = require('fs');
const path = require('path');
// language
const menuFactroy = require('./menus/menuFactory');
const i18next = require("i18next");
const Backend = require("i18next-node-fs-backend");
const i18nextOptions = require("./i18nextOptions");
const logging = require('./libraries/logging');
// terminal
const pty = require('node-pty');
const upath = require("upath");

// Setting ENVIROMENT
process.env.NODE_ENV = 'development';
// process.env.NODE_ENV = 'production';

// the settings object - to be passed around - add here other properties
let theSettings = {
  language: 'en',
  languageNS: 'en_US',
  workingDirectory: os.homedir(),
  dependencies: '',
  dialogs: {},
  currentCommand: '',
  missingPackages: ''
};

// loading language from settings
let settingsFileData  = fs.readFileSync(path.resolve('./settings.json'), 'utf8');
try{
  settingsFileData = JSON.parse(settingsFileData);
  theSettings.dependencies = settingsFileData.dependencies;
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
      },
      show: false
    });

    // and load the index.html of the app.
    mainWindow.loadFile('./components/main/main.html');

    // Open the DevTools.
    mainWindow.webContents.openDevTools();

    // maximize
    // mainWindow.maximize();

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    // Insert menu after language has loaded
    i18next.on('languageChanged', () => {
        Menu.setApplicationMenu(menuFactroy(app, mainWindow, i18next, theSettings));        
    });

    // when window is ready send data
    mainWindow.once("ready-to-show", ()=>{
        mainWindow.show();
    });
    // when data is ready show window
    mainWindow.once("show", () => {
        let appPath = path.resolve('./'); 
        mainWindow.webContents.send('initializeApp', {dependencies: theSettings.dependencies, appPath: upath.normalize(appPath)});
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

// check for missing packages
ipcMain.on('missingPackages', (event, args) => {   
  if (args.length > 0) {
    // save the missing packages
    theSettings.missingPackages = args;
    // dialog.showMessageBox(mainWindow, {type: "warning", message: "The folowing packages: "+ args +" are missing or not install in R. Some dialogs will not work. Please install the packages and restart the application.", title: "Warning", buttons: ["OK"]});
  }
}); 

// save dialogs state
ipcMain.on('dialogCurrentStateUpdate', (event, args) => {
  // save dialog state to settings
  if (theSettings.dialogs[args.name]) {
    theSettings.dialogs[args.name] = args.changes;
  } else {
    theSettings.dialogs[args.name] = {};
    theSettings.dialogs[args.name] = args.changes;
  }
});


// event on dialog created - send data
ipcMain.on('dialogCreated', (event, args) => {
  mainWindow.webContents.send('dialogCreated', args);
});
// show the current dialog command
ipcMain.on('dialogCommandUpdate', (event, args) => {
  mainWindow.webContents.send('commandSyntax', args);
});
// run a dialog's command
ipcMain.on('runCommand', (event, args) => {
  mainWindow.webContents.send('runCommand', args);
});

// terminal PTY
let shell = (os.platform() === 'win32') ? 'R.exe' : 'R';
process.env.TERM = 1;
process.env.WINPTY_FLAG_PLAIN_OUTPUT = 1;
const ptyProcess = pty.spawn(shell, ['-q', '--no-save', 'WINPTY_FLAG_PLAIN_OUTPUT'], {
// const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 100,
  rows: 400,
  cwd: process.env.HOME,
  env: process.env,
});
console.log(process.env);

// send data from pty
ptyProcess.on('data', function (data) {

  let cleanData = data;
  // cleanData = data.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
  // let cleanData = data.replace(/\u001b\[.*?m/g, '');
  
  if (cleanData.trim().length < 4) {
    console.log(cleanData);
  }
  if (cleanData != '') {
    mainWindow.webContents.send('ptyData', cleanData);
  }

});
// send data to pty
ipcMain.on('toPtyData', (event, args) => {
  ptyProcess.write(args);
});