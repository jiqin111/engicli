#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

// 读取本地版本号
const pkgPath = path.join(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const localVersion = pkg.version;

// 处理参数
const args = process.argv.slice(2);

// ==============================================
// 版本查看 -v / --version
// ==============================================
if (args.includes('-v') || args.includes('--version')) {
  console.log(`engicli version: ${localVersion}`);
  process.exit(0);
}

// ==============================================
// 自动更新检查（修复版：会打印日志，不会静默失败）
// ==============================================
async function checkUpdate() {
  try {
    console.log("🔍 正在检查更新..."); // 加了提示，你就知道它在工作

    const response = await fetch('https://registry.npmjs.org/@engiproject/engicli');
    const data = await response.json();
    const latestVersion = data['dist-tags'].latest;

    // 打印版本号，你能看到到底取没取到最新版
    console.log(`本地版本: ${localVersion}`);
    console.log(`最新版本: ${latestVersion}`);

    if (localVersion !== latestVersion) {
      console.log(`\n🚀 发现新版本：${latestVersion}，正在自动更新...`);
      execSync('npm install -g @engiproject/engicli@latest', {
        stdio: 'inherit',
        shell: true
      });
      console.log('\n✅ 更新完成！请重新运行 engicli');
      process.exit(0);
    } else {
      console.log('✅ 当前已是最新版本\n');
    }
  } catch (err) {
    // 原来这里是空的！现在告诉你失败原因！
    console.log('⚠️ 检查更新失败，继续启动 CLI\n');
    console.log('失败原因：', err.message);
  }
}

// ==============================================
// 启动主程序
// ==============================================
checkUpdate().then(() => {
  const exePath = path.join(__dirname, 'engicli.exe');

  const child = spawn(exePath, args, {
    stdio: 'inherit'
  });

  child.on('error', (err) => {
    console.error('启动 engicli 失败:', err);
  });
});