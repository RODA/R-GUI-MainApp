
const os = require('os');
const pty = require('node-pty');
const Terminal = require('xterm').Terminal;
const { BrowserWindow } = require('electron').remote;

const comm = {
  // set R working directory
  setWorkingDirectory: function(dir)
  {
      ptyProcess.write('setwd("' + dir + '")\r');
  },

  resizeTerm: function()
  {
    let size = BrowserWindow.getFocusedWindow().getSize(); 
    let commandHeight = document.getElementById('command').offsetHeight;
  
    let newWidth = Math.floor((size[0] - 65) / 7) - 1;
    let newHeight = Math.floor((size[1] - (83 + commandHeight)) / 15) - 1;
  
    ptyCols = newWidth;
    ptyRows = newHeight;
    
    xterm.resize(newWidth, newHeight);
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
    selection: 'rgba(193, 221, 255, 0.5)',
    yellow: '#FF0000',
    brightYellow: '#FF0000'
  }
});
xterm.open(document.getElementById('xterm'));

let theWindow = BrowserWindow.getFocusedWindow();
comm.resizeTerm();
theWindow.on('resize', debounce(comm.resizeTerm, 500, false));

// set the shell and R terminal
var shell;
var r;
if (os.platform() === 'win32') {
  // shell = 'cmd.exe';
  shell = 'powershell.exe';
  // shell = 'bash.exe';
  r = 'R.exe -q';
} else {
  shell= 'bash';
  r = 'R -q';
}
const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 200,
  rows: 100,
  cwd: process.env.HOME,
  env: process.env
});

// start the R terminal
ptyProcess.write(r + '\r');




let currentCommand = '';

// Setup communication between xterm.js and node-pty
xterm.onData(function sendData(data)
{
  ptyProcess.write(data);
});
ptyProcess.on('data', function (data) {  
  xterm.write(data);
});

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

// resize terminal




module.exports = comm;