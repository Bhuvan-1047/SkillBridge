const path = require('path');
const { spawn } = require('child_process');

// 1. Start Express Backend directly (no npm wrapper, no shell deprecation warning)
const server = spawn(process.execPath, ['server.js'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
});

// 2. Start Vite React Frontend directly
const viteBin = path.join(__dirname, 'client', 'node_modules', 'vite', 'bin', 'vite.js');
const client = spawn(process.execPath, [viteBin], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
});

// Graceful shutdown on Ctrl+C
const cleanExit = () => {
  server.kill('SIGINT');
  client.kill('SIGINT');
  process.exit(0);
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);
