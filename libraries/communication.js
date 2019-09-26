
const os = require('os');
const pty = require('node-pty');
var Terminal = require('xterm').Terminal;

// Initialize xterm.js and attach it to the DOM
const xterm = new Terminal();
xterm.open(document.getElementById('xterm'));

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

const ptyProcess = pty.spawn(shell, [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.env.HOME,
  env: process.env
});

ptyProcess.write('R.exe -q\n')

// Setup communication between xterm.js and node-pty
xterm.onData(data => ptyProcess.write(data));
ptyProcess.on('data', function (data) {
  xterm.write(data);
});


// ptyProcess.on('data', function(data) {
//   process.stdout.write(data);
// });
// ptyProcess.write('ls\r');
// ptyProcess.resize(100, 40);
// ptyProcess.write('ls\r');

const comm = {

    // set R working directory
    setWorkingDirectory: function(dir)
    {
        ptyProcess.write('setwd("' + dir + '")\n');
    }

}

module.exports = comm;