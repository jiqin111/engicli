const fs = require('fs');
const path = require('path');
const os = require('os');

function install() {
    console.log('📦 正在安装 engicli 命令行工具...');

    const sourceExe = path.join(__dirname, 'engicli.exe');
    const destDir = path.join(os.homedir(), '.engicli');
    const destExe = path.join(destDir, 'engicli.exe');

    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }

    fs.copyFileSync(sourceExe, destExe);
    console.log('✅ 安装成功！');
    console.log('');
    console.log('使用方式：');
    console.log('  engicli auth login');
    console.log('  engicli list_stations');
}

install();