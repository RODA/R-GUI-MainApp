const os = require('os');
const pty = require('node-pty');
const Terminal = require('xterm').Terminal;
const { ipcRenderer } = require('electron');
const { BrowserWindow } = require('electron').remote;
const fs = require('fs');

// TODO -- to be removed
// testing only
const mockupData = {
    dataframes: {
        "df1": ["v_1_1", "v_1_2", "v_1_3", "v_1_4", "v_1_5", "v_1_6" ],
        "df2": ["v_2_1", "v_2_2", "v_2_3", "v_2_4", "v_2_5", "v_2_6" ],
        "df3": ["v_3_1", "v_3_2", "v_3_3", "v_3_4", "v_3_5", "v_3_6" ]
    },
    selectData: {
        "dataframe": ["df1", "df2", "df3"],
        "matrix": ["m1", "m2", "m3"],
        "vector": ["v1", "v2", "v3"],
        "list": ["l1", "l2", "l3"]
    }
};

// we use this variable to send invisible data to R
let invisible = false;

const comm = {
    // used for window resize event
    initial: true,

    // set R working directory
    setWorkingDirectory: function(dir)
    {
        // invisible = true;
        // ptyProcess.write('setwd("' + dir + '")\n');
        ipcRenderer.send('dataFromR', mockupData);
    },
    // check for dependencies
    checkForRPackages: function(list)
    {
        // console.log(JSON.stringify(list));
           
        // invisible = true;
        // ptyProcess.write('\r');
    },
    // process invisible data
    processData: function(data) 
    {
        // TODO -- parse data and emit different events
        // ipcRenderer.emit('backFromR', data);
        console.log('process');
        
        // send message about the missing packages
        // ipcRenderer.send('missingPackages', 'QCA, abcdeFBA, ACNE');
        
    },
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
        ptyProcess.resize(newWidth, newHeight);

        // add resize listener
        if (this.initial) {
            theWindow.on('resize', debounce(comm.resizeTerm, 500, false));
            this.initial = false;
        }
    }

};



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

// set the shell and R terminal
let shell;
let rShortcutOS = "";
let initializeXTerm = true;
if (os.platform() === 'win32') {
    // shell = 'cmd.exe';
    // shell = 'bash.exe';
    shell = 'powershell.exe';
    rShortcutOS = 'R.exe -q --no-save\r\n';
} else {
    shell= 'bash';
    rShortcutOS = 'R -q --no-save\r\n';
}
const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env,
    // encoding: null
});


// Setup communication between xterm.js and node-pty
xterm.onData(function sendData(data) {
    ptyProcess.write(data);
});

let countP = 0;
// // Setup communication between node-pty and xterm.js
ptyProcess.on('data', function (data) 
{      
    // console.log(typeof data);
    // console.trace(data.toString());
    
    const prompter = data.charAt(6) === ">";

    if (initializeXTerm) {
        data = '';
        if (prompter) {
            xterm.write('\r\n');
            xterm.write(' R-GUI-MainApp terminal\r\n');
            xterm.write('\r\n');
            xterm.write('> ');
            // invisible = true;
            // ptyProcess.write('1 + 1\n');
            initializeXTerm = false;  
        }
        return;    
    }

    // if (invisible) {
    //     if (prompter) countP++;
    //     if(countP == 2) { 
    //         invisible = false;
    //         countP = 0;
    //         console.log('invizibil');
    //         comm.processData(data);
    //     }
    // } 
    if (data !==' ') {
        if (data.indexOf("Error: ") >= 0) {
            // make line red
            xterm.write(colors.red(data));
        } else {
            // console.log('final');
            // xterm.write('final');
            xterm.write(data);
        }
    }
});



// Helpers ===========================================================
// for resizing the terminal
function debounce(func, wait, immediate) 
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
}
// change command color for XTerm
const colors = {
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
}; 

// start the R terminal
ptyProcess.write(rShortcutOS);



module.exports = comm;