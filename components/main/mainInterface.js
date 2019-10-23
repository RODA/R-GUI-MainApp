const os = require('os');
const pty = require('node-pty');
const Terminal = require('xterm').Terminal;

const { BrowserWindow } = require('electron').remote;
const { ipcRenderer } = require('electron');
const Split = require('split.js');
// const comm = require('../../libraries/communication');
const commHelpers = require('./../../libraries/communicationHelpers');

const helpers = {
    initial: true,

    // Helpers ===========================================================
    // resize the terminal with the window
    resizeTerm: function()
    {
        let theWindow = BrowserWindow.getFocusedWindow(); 
        let size = theWindow.getSize(); 
        let commandHeight = document.getElementById('command').offsetHeight;

        let newWidth = Math.floor((size[0] - 65) / 7) - 1;
        let newHeight = Math.floor((size[1] - (83 + commandHeight)) / 15) - 1;

        ptyCols = newWidth;
        ptyRows = newHeight;

        xterm.resize(newWidth, newHeight);
        // ptyProcess.resize(newWidth, newHeight); -- problem with xterm

        // add resize listener
        if (this.initial) {
            theWindow.on('resize', this.debounce(helpers.resizeTerm, 500, false));
            this.initial = false;
        }
    },
    // for resizing the terminal
    debounce: function(func, wait, immediate) 
    {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    },
    // change command color for XTerm
    colors: {
        magenta: function(line) {
            return("\u001b[35m" + line + "\u001b[0m");
        },
        blue: function(line) {
            return("\u001b[34m" + line + "\u001b[0m");
        },
        red: function(line) {
            return("\u001b[31m" + line + "\u001b[0m");
        },
        bold: function(line) {
            return("\u001b[1m" + line + "\u001b[0m");
        }
    }
};

// global variables
let responseGlobal = '';
let invisibleGlobal = true;

// terminal PTY
let shell = (os.platform() === 'win32') ? 'R.exe' : 'R';
// const ptyProcess = pty.spawn(shell, [], {
const ptyProcess = pty.spawn(shell, ['-q', '--no-save'], {
    name: 'xterm-color',
    cols: 100,
    rows: 400,
    cwd: process.env.HOME,
    env: process.env,
});

// Initialize xterm.js and attach it to the DOM
const xterm = new Terminal({
    fontSize: 13,
    tabStopWidth: 4,
    cursorBlink: true,
    cursorStyle: 'bar',
    cols: 10,
    rows: 10,
    lineHeight: 1,
    // rendererType: 'dom',
    theme: {
        background: '#f8f8f8',
        foreground: '#000080',
        cursor: '#ff0000',
        cursorAccent: '#ff0000',
        selection: 'rgba(193, 221, 255, 0.5)'
    }
});

xterm.open(document.getElementById('xterm'));
// Setup communication between xterm.js and node-pty
xterm.onData(data => ptyProcess.write(data));
// data back from PTY
ptyProcess.on('data', function(data){
    console.log('---------- data from PTY ---------');
    console.log(data);
    if (invisibleGlobal) {
    } else {
        xterm.write(data);
    }
});

// resize the terminal
helpers.resizeTerm();

ipcRenderer.on('initializeApp', (event, args) => {
    // start command
    setTimeout( function(){
    ptyProcess.write(
        'source("' + args.appPath + '/RGUI_call.R");' + 
        'aa <- data.frame(A = 1:5);' +
        'RGUI_dependencies(' + commHelpers.Rify(args.dependencies) + ');' +
        'RGUI_call(); \n'
    );
    }, 2000);
});



Split(['#command', '#xterm'], {
    elementStyle: (dimension, size, gutterSize) => ({
        'flex-basis': `calc(${size}% - ${gutterSize}px)`,
    }),
    gutterStyle: (dimension, gutterSize) => ({
        'flex-basis':  `${gutterSize}px`,
    }),
    direction: 'vertical',
    sizes: [15, 85],
    minSize: [100, 200],
    onDragEnd: () => {       
        comm.resizeTerm();   
    }
});





// show current dialog command | update HTML element
ipcRenderer.on('commandSyntax', (event, args) => {
    document.getElementById('command').innerHTML = args;
});

// dialog send initial data
ipcRenderer.on('dialogCreated', (event, args) => {
    let data = comm.getCurrentData();
    ipcRenderer.send('dialogInitialData', {name: args.name, data: data});
});
// run a R commmand from a dialog
ipcRenderer.on('runCommand', (event, args) => {
    comm.runRCommand(args);
});
// run a R commmand from system | invisible
ipcRenderer.on('runCommandInvisible', (event, args) => {
    comm.runRCommandInvisible(args);
});


