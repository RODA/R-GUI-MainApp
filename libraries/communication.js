
const os = require('os');
const pty = require('node-pty');
const Terminal = require('xterm').Terminal;
const { BrowserWindow } = require('electron').remote;

// Initialize xterm.js and attach it to the DOM
const xterm = new Terminal({
  fontSize: 13,
  tabStopWidth: 4,
  cursorBlink: true,
  cursorStyle: 'bar',
  // fontFamily: 'Arial',
  // lineHeight: ,
  cols: 10,
  rows: 35,
  // letterSpacing: 1,
  // rendererType: 'dom',
  theme: {
    background: '#000000',
    foreground: '#ccc',
    cursor: '#000000',
    cursorAccent: '#ffffff',
    selection: 'rgba(193, 221, 255, 0.5)'
  }
});
xterm.open(document.getElementById('xterm'));

let theWindow = BrowserWindow.getFocusedWindow();

theWindow.on('resize', function(){
  let size = theWindow.getSize();

  let newWidth = Math.floor(size[0] / 7);
  let newHeight = Math.floor(size[1] / 7);

  xterm.resize(newWidth, newHeight);
  
});

// set the shell and R terminal
var shell;
var r;
if (os.platform() === 'win32') {
  shell = 'cmd.exe';
  shell = 'powershell.exe';
  // shell = 'bash.exe';
  r = 'R.exe -q';
} else {
  shell= 'bash';
  r = 'R -q';
}

const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 80,
  rows: 50,
  cwd: process.env.HOME,
  env: process.env
});

// start the R terminal
ptyProcess.write(r + '\r');

// Setup communication between xterm.js and node-pty
xterm.onData(data => ptyProcess.write(data));

ptyProcess.on('data', function (data) {
  xterm.write(data);
});

const comm = {
    // set R working directory
    setWorkingDirectory: function(dir)
    {
        ptyProcess.write('setwd("' + dir + '")\r');
    }

};

module.exports = comm;