const os = require('os');
const pty = require('node-pty');
const Terminal = require('xterm').Terminal;
const { ipcRenderer } = require('electron');
const { BrowserWindow } = require('electron').remote;
const logger = require('./logging');
// const fs = require('fs');
const commHelpers = require('./communicationHelpers');

// TODO -- to be removed testing only

const mockupData = {
    "dataframe": {
        "df1": {"nrows": [1], // number of rows
                "ncols": [1], // number of columns
                "rownames": [],
                "colnames": [],
                "numeric": [], // true, false (for all columns)
                "calibrated": [], // true, false (for all columns)
                "binary": [], // true, false (for all columns)
                "scrollvh": [], // length 2: start row and start column
                "vdata": [[], [], ], // visible data
                "vcoords": "" // sort of a useful hash for the visible data, something like: "1_1_17_8_50"
                // "startrow_startcol_endrow_endcol_ncols"
            },
    },
    "list": [], // just the names of the objects
    "matrix": [], // just the names of the objects
    "vector": [], // just the names of the objects
};


// number of visible rows and columns assume all cells have equal height and width
// but this might change when further developing the data editor
let infobjs = {
    "vrows": 17, // visible rows in (from) the data editor
    "vcols": 8, // visible columns
    "active": "", // the name of the currently selected dataframe in the data editor
    "dataframe": {},
    "list": [],
    "matrix": [],
    "vector": []
};


// we use this variable to send invisible data to R
let invisible = true;
let dataFromR;

const comm = {
    // used for window resize event
    initial: true,

    // start the app
    initializeCommunication: function(data)
    {
        invisible = true;
        // send function to communicate to r
        // send function to check for dependencies
        ptyProcess.write('source("' + data.appPath + '/RGUI_call.R"); aa <- data.frame(A = 1:5); RGUI_call(list(dependencies = list(' + commHelpers.Rify({ x: data.dependencies}) + ')))\n');
    },
    // run a command
    runRCommand: function(command)
    {
        ptyProcess.write(command + '\n');
        
        // TODO -- remove only for testing --
        // ipcRenderer.send('dialogDataUpdate', {dataframes: {"df1": ["v_1_1", "v_1_2", "v_1_3", "v_1_4", "v_1_5", "v_1_6", "v_1_7"]}});
    },
    // run a command without showing the output in the terminal
    runRCommandInvisible: function(command)
    {
        invisible = true;
        ptyProcess.write(command + '\n');
    },
    
    // process invisible data
    processData: function(data) 
    {
        
        
        let rParsed = data.split('\n');
        console.log(rParsed);
        if (rParsed.length === 2 || !rParsed[0].indexOf('--no-save')) {
            try{
                rParsed = JSON.parse(rParsed[1]);
            }
            catch(error) {
                logger.error('Could not parse data from R | ' + error);
            }   
        }        

        if (rParsed !== void 0) 
        {
            // missing packages - first time only
            if (rParsed.missing !== void 0) {
                ipcRenderer.send('missingPackages', rParsed.missing);
            }

            


        }
        // console.log();


        response = '';
        invisible = false;
        // TODO -- remove only for testing -- 
        // send message about the missing packages
        // ipcRenderer.send('missingPackages', ['abcdeFBA', 'ACNE', 'QCA']);
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
        // ptyProcess.resize(newWidth, newHeight); -- problem with xterm

        // add resize listener
        if (this.initial) {
            theWindow.on('resize', debounce(comm.resizeTerm, 500, false));
            this.initial = false;
        }
    },
    
    // return current data received from R
    getCurrentData: function()
    {
        return mockupData;
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
let typing = false;
let response = '';
if (os.platform() === 'win32') {
    // shell = 'cmd.exe';
    // shell = 'bash.exe';
    // shell = 'powershell.exe';
    shell = 'pwsh.exe';
    rShortcutOS = 'R.exe -q --no-save\r\n';
} else {
    shell= 'bash';
    rShortcutOS = 'R -q --no-save\n';
}
const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 500,
    rows: 100,
    cwd: process.env.HOME,
    env: process.env,
    conptyInheritCursor: false
});

// Setup communication between xterm.js and node-pty
xterm.onData(function sendData(data) {
    typing = true;
    ptyProcess.write(data);
});

let countP = 0;
// Setup communication between node-pty and xterm.js
ptyProcess.on('data', function (data) 
{
    console.log(data);
    
    const prompter = data.charAt(0) === ">";
    // // 
    // if (prompter) { 
    //     countP++; 
    // }

    // if (initializeXTerm) {
    //     data = '';
    //     if (prompter) {
    //         // xterm.write('\r\n');
    //         // xterm.write(' R-GUI-MainApp terminal\r\n');
    //         // xterm.write('\r\n');
    //         // xterm.write('> ');
    //         // invisible = true;
    //         // ptyProcess.write('1 + 1\n');
    //         initializeXTerm = false;  
    //     }
    //     return;    
    // }
    
    // we should have only one line
    // console.trace(invisible);
    // console.log(prompter);
    
    if (invisible) {
        if (!prompter) {
            response += data;
        } else {
            comm.processData(response);
        }
    } else
    // send data to terminal 
    if (data !=='') {
        if (data.indexOf("Error ") >= 0) {
            // make line red
            xterm.write(colors.red(data));
        } else {
            // write to terminal
            xterm.write(data);
        }
        if (prompter) {
            comm.runRCommandInvisible(commHelpers.Rify())
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
// function prepRcommand() {
//     if (info["data"] !== null) {
//         var datasets = getKeys(info["data"]);
//         for (var i = 0; i < datasets.length; i++) {
//             Rcommand.scrollvh[datasets[i]] = info["data"][datasets[i]].scrollvh;
//         }
//     }
//     return(Rify(Rcommand));
// }



// start the R terminal
ptyProcess.write(rShortcutOS);



module.exports = comm;
