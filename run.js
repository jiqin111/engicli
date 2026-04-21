#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const fetch = require('node-fetch');

// 读取本地版本号（从 package.json 取，全局统一）
const pkgPath = path.join(__dirname, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const localVersion = pkg.version;

// ==============================================
// 1. 处理版本查看：-v --version
// ==============================================
const args = process.argv.slice(2);
if (args.includes('-v') || args.includes('--version')) {
  console.log(`engicli version: ${localVersion}`);
  process.exit(0);
}

// ==============================================
// 2. 自动更新检查
// ==============================================
async function checkUpdate() {
  try {
    const response = await fetch('https://registry.npmjs.org/@engiproject/engicli');
    const data = await response.json();
    const latestVersion = data['dist-tags'].latest;

    if (localVersion !== latestVersion) {
      console.log(`\n🔍 发现新版本：${latestVersion} (当前：${localVersion})`);
      console.log('🚀 正在自动更新...\n');

      execSync('npm install -g @engiproject/engicli@latest', {
        stdio: 'inherit',
        shell: true
      });

      console.log('\n✅ 更新完成！请重新运行 engicli');
      process.exit(0);
    }
  } catch (err) {
    // 更新失败不影响使用
  }
}

// ==============================================
// 3. 启动你的 engicli.exe（无警告版）
// ==============================================
checkUpdate().then(() => {
  const exePath = path.join(__dirname, 'engicli.exe');

  // 去掉 shell: true 彻底解决安全警告
  const child = spawn(exePath, args, {
    stdio: 'inherit'
  });

  child.on('error', (err) => {
    console.error('启动 engicli 失败:', err);
  });
});