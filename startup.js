#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting eBus Application...\n');

// Start the API service
const apiPath = path.join(__dirname, 'services', 'api', 'dist', 'index.js');
console.log('📡 Starting API service...');
console.log(`API path: ${apiPath}`);

const apiProcess = spawn('node', [apiPath], {
  stdio: 'inherit',
  cwd: path.join(__dirname, 'services', 'api')
});

// Start the client app
console.log('🌐 Starting client app...');
const clientProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, 'apps', 'client')
});

// Start the admin app
console.log('👨‍💼 Starting admin app...');
const adminProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, 'apps', 'admin')
});

// Start the superadmin app
console.log('🔧 Starting superadmin app...');
const superadminProcess = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit',
  cwd: path.join(__dirname, 'apps', 'superadmin')
});

// Error handling for all processes
apiProcess.on('error', (error) => {
  console.error('❌ Failed to start API service:', error);
  process.exit(1);
});

clientProcess.on('error', (error) => {
  console.error('❌ Failed to start client app:', error);
});

adminProcess.on('error', (error) => {
  console.error('❌ Failed to start admin app:', error);
});

superadminProcess.on('error', (error) => {
  console.error('❌ Failed to start superadmin app:', error);
});

// Exit handling
apiProcess.on('exit', (code) => {
  console.log(`API service exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down all services...');
  apiProcess.kill('SIGINT');
  clientProcess.kill('SIGINT');
  adminProcess.kill('SIGINT');
  superadminProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down all services...');
  apiProcess.kill('SIGTERM');
  clientProcess.kill('SIGTERM');
  adminProcess.kill('SIGTERM');
  superadminProcess.kill('SIGTERM');
}); 