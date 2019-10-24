// terminal
const os = require('os');
const pty = require('node-pty');
const Terminal = require('xterm').Terminal;
const { ipcRenderer } = require('electron');
const { BrowserWindow } = require('electron').remote;
const logger = require('./logging');
const upath = require("upath");
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
// but this mig`ht change when further developing the data editor
let infobjs = {
    "vrows": 17, // visible rows in (from) the data editor
    "vcols": 8, // visible columns
    "active": "", // the name of the currently selected dataframe in the data editor
    "dataframe": {},
    "select": {
        "list": [],
        "matrix": [],
        "vector": []
    }
};

    // terminal PTY
let shell = (os.platform() === 'win32') ? 'R.exe' : 'R';
const ptyProcess = pty.spawn(shell, ['-q', '--no-save'], {
    // const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-color',
    cols: 100,
    rows: 40,
    cwd: process.env.HOME,
    env: process.env,
    useConpty: true,
    conptyInheritCursor: true
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
xterm.onData( data => { ptyProcess.write(data); });

// we use this variable to send invisible data to R
let invisible = true;
let response;

ptyProcess.on('data', data => {
    
    // let prompter = data.charAt(6) === ">";
    // let prompter = data.includes(">");
    // console.log(data);
    
    xterm.write(data);

    // if (invisible) {
    //     if (!prompter) {
    //         response += data;
    //     } else {
    //         comm.processData(response);
    //     }
    // } else
    // // send data to terminal 
    // if (data !=='') {
    //     if (data.indexOf("Error ") >= 0) {
    //         // make line red
    //         xterm.write(colors.red(data));
    //     } else {
    //         // write to terminal
    //         xterm.write(data);
    //     }
    //     if (prompter) {
    //         comm.runRCommandInvisible(commHelpers.Rify());
    //     }
    // }
});
const mkd = require('./test.json');
// const mkd = JSON.parse(testData);
// console.log(mkd);


const comm = {
    // used for window resize event
    initial: true,

    // start the app
    // send function to communicate to r
    // send function to check for dependencies
    initiateCommunication: function(data)
    {       
        let commands = 'source("' + data.appPath + '/RGUI_call.R"); aa <- data.frame(A = 1:5); RGUI_dependencies(' + commHelpers.Rify(data.dependencies) + '); RGUI_call();';
        this.runRCommandInvisible(commands);
        comm.processData(mkd);
    },
    
    // run a command
    runRCommand: function(command)
    {
        xterm.write(command + '\n');
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
        // let obj = JSON.parse(data);
        let obj = data;

        // anounce missing packages || only when the app starts
        if (obj.missing !== void 0) {
            // do we have any?
            if (obj.missing.length > 0) {
                ipcRenderer.send('missingPackages', obj.missing);
            }
        }
        // anything changed
        if (obj.changed !== void 0) {
            for( let key in obj.changed) {
                // update / create data frame
                if (key === 'dataframe') {
                    for (let i in obj.changed[key]) {
                        if (infobjs.dataframe[i] === void 0) {
                            infobjs.dataframe[i] = {};
                            infobjs.dataframe[i] = Object.create({}, obj.changed[key][i]);
                        } else {
                            infobjs.dataframe[i] = Object.create({}, obj.changed[key][i]);
                        }
                    }
                }
                // update / create list
                if (key === 'list') {
                    for (let i = 0; i < obj.changed[key].length; i++) {
                        if (!infobjs.select.list[i].includes(obj.changed[key][i])) {
                            infobjs.select.list.push(obj.changed[key][i]);
                        }
                    }
                }
                // update / create matrix
                if (key === 'matrix') {
                    for (let i = 0; i < obj.changed[key].length; i++) {
                        if (!infobjs.select.matrix[i].includes(obj.changed[key][i])) {
                            infobjs.select.matrix.push(obj.changed[key][i]);
                        }
                    }
                }
                // update / create vector
                if (key === 'vector') {
                    for (let i = 0; i < obj.changed[key].length; i++) {
                        if (!infobjs.select.vector[i].includes(obj.changed[key][i])) {
                            infobjs.select.vector.push(obj.changed[key][i]);
                        }
                    }
                }
            }
        }
        // is any element deleted ?
        if (obj.deleted !== void 0) {
            for( let key in obj.changed) {
                // delete data frame
                if (key === 'dataframe') {
                    for (let i in obj.changed[key]) {
                        if (infobjs.dataframe[i] !== void 0) {
                            delete infobjs.dataframe[i];
                        }
                    }
                }
                // delete list
                if (key === 'list') {
                    for (let i = 0; i < obj.changed[key].length; i++) {
                        let index = infobjs.select.list[i].indexOf(obj.changed[key][i]);
                        if ( index != -1) {
                            infobjs.select.list.splice(index, 1);
                        }
                    }
                }
                // delete matrix
                if (key === 'matrix') {
                    for (let i = 0; i < obj.changed[key].length; i++) {
                        let index = infobjs.select.matrix[i].indexOf(obj.changed[key][i]);
                        if ( index != -1) {
                            infobjs.select.matrix.splice(index, 1);
                        }
                    }
                }
                // delete vector
                if (key === 'vector') {
                    for (let i = 0; i < obj.changed[key].length; i++) {
                        let index = infobjs.select.vector[i].indexOf(obj.changed[key][i]);
                        if ( index != -1) {
                            infobjs.select.vector.splice(index, 1);
                        }
                    }
                }
            }
        }
    },

    // return current data
    getCurrentData: function()
    {
        return infobjs;
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