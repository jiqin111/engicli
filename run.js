#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const exePath = path.join(__dirname, 'engicli.exe');
const args = process.argv.slice(2);

const child = spawn(exePath, args, {
    stdio: 'inherit',
    shell: true
});

child.on('error', (err) => {
    console.error('启动 engicli 失败:', err);
});