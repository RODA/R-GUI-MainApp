const Terminal = require('xterm').Terminal;
const { ipcRenderer } = require('electron');
const { BrowserWindow } = require('electron').remote;
const logger = require('./logging');
// const fs = require('fs');
const commHelpers = require('./communicationHelpers');

// TODO -- to be removed testing only

const mockupData = {
    "dataframe": {
        "df1": {"nrows": [], // number of rows
                "ncols": [], // number of columns
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
// let invisible = true;
// let dataFromR;

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
xterm.onData( data => {
    ipcRenderer.send('toPtyData', data);
});

// global variables
let responseGlobal = '';
let invisibleGlobal = false;

const comm = {
    initial: true,

    // start the app
    // send function to communicate to r
    // send function to check for dependencies
    initiateCommunication: function(data)
    {
        invisibleGlobal = true;
        ipcRenderer.send('toPtyData',
            'source("' + data.appPath + '/RGUI_call.R");' + 
            'aa <- data.frame(A = 1:5);' +
            'RGUI_dependencies(' + commHelpers.Rify(data.dependencies) + ');' +
            'RGUI_call(); \n'
        );
    },
    
    // run a command
    runRCommand: function(command)
    {
        xterm.write(command + '\n');
    },
    
    // run a command without showing the output in the terminal
    runRCommandInvisible: function(command)
    {
        invisibleGlobal = true;
        ipcRenderer.send('toPtyData', command + '\n');
    },
    
    // process invisible data
    processData: function(data) 
    {        
        console.log(data);
        
        let prompter = data.charAt(0) === ">";
        
        if (invisibleGlobal) {
            console.log(prompter);
            
            if (!prompter) {
                responseGlobal += data;
                // console.log(responseGlobal);
                    
            } else {       
                                     
                comm.processInvisible(responseGlobal);
            }
        } 
        // send data to terminal 
        else if (data !=='') 
        {
            if (data.indexOf("Error ") >= 0) {
                // make line red
                xterm.write(colors.red(data));
            } else {
                // write to terminal
                xterm.write(data);
            }
            if (prompter) {
                this.runRCommandInvisible('RGUI_call();')
            }
        }

    },
    processInvisible: function(data)
    {
        console.log('here');
        
        console.log(data);
        

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
        responseGlobal = '';
        invisibleGlobal = false;
    },

    // return current data received from R
    getCurrentData: function()
    {
        return mockupData;
    },

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
            theWindow.on('resize', this.debounce(comm.resizeTerm, 500, false));
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

module.exports = comm;





// let countP = 0;
// Setup communication between node-pty and xterm.js
// ptyProcess.on('data', function (data) 
// {
//     console.log(data);
    
//     const prompter = data.charAt(0) === ">";
//     // // 
//     // if (prompter) { 
//     //     countP++; 
//     // }

//     // if (initializeXTerm) {
//     //     data = '';
//     //     if (prompter) {
//     //         // xterm.write('\r\n');
//     //         // xterm.write(' R-GUI-MainApp terminal\r\n');
//     //         // xterm.write('\r\n');
//     //         // xterm.write('> ');
//     //         // invisible = true;
//     //         // ptyProcess.write('1 + 1\n');
//     //         initializeXTerm = false;  
//     //     }
//     //     return;    
//     // }
    
//     // we should have only one line
//     // console.trace(invisible);
//     // console.log(prompter);
    
//     if (invisible) {
//         if (!prompter) {
//             response += data;
//         } else {
//             comm.processData(response);
//         }
//     } else
//     // send data to terminal 
//     if (data !=='') {
//         if (data.indexOf("Error ") >= 0) {
//             // make line red
//             xterm.write(colors.red(data));
//         } else {
//             // write to terminal
//             xterm.write(data);
//         }
//         if (prompter) {
//             comm.runRCommandInvisible(commHelpers.Rify())
//         }
//     }
// });





 


