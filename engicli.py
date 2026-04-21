import click
import requests
import json
import os
import time
import sys
from pathlib import Path

# ====================== 你的配置 ======================
BASE_URL = "https://web-release.iheatingos.com/digital-service"
LOGIN_PAGE = "https://web-release.iheatingos.com/engipower-refactoring"
TOKEN_KEY = "MYTOKEN"
CLI_CONFIG = Path.home() / ".heating-cli"
TOKEN_FILE = CLI_CONFIG / "token.json"
# ======================================================

os.makedirs(CLI_CONFIG, exist_ok=True)

# ====================== Token 管理 ======================
def save_token(token):
    with open(TOKEN_FILE, "w", encoding="utf-8") as f:
        json.dump({"token": token}, f, ensure_ascii=False, indent=2)

def load_token():
    if not TOKEN_FILE.exists():
        return None
    try:
        with open(TOKEN_FILE, encoding="utf-8") as f:
            return json.load(f)
    except:
        return None

def get_token():
    t = load_token()
    if not t:
        click.echo("❌ 请先登录：python engicli.py auth login")
        sys.exit(1)
    return t["token"]

# ====================== 请求头 ======================
def get_headers():
    return {
        "accept": "application/json;charset=UTF-8",
        "content-type": "application/json",
        "authorization": f"Bearer {get_token()}",
        "modeltype": "00",
        "x-sign": "engi666",
        "x-time": str(int(time.time() * 1000)),
        "x-nonce": "cli-auto",
        "user-agent": "Mozilla/5.0",
    }

# ====================== 主 CLI ======================
@click.group()
def cli():
    """英集智慧供热系统 CLI - AI 专用（稳定版）"""
    pass

# ====================== 授权命令 ======================
@cli.group()
def auth():
    """登录相关"""
    pass

@auth.command()
def login():
    """一键登录（打开浏览器 + 自动粘贴工具）"""
    click.echo("✅ 浏览器已打开，请登录系统")
    click.echo("📌 登录后按 F12 → Application → LocalStorage → 复制 MYTOKEN")
    click.echo("📌 然后回到这里，执行：python engicli.py auth sync\n")
    os.startfile(LOGIN_PAGE)

@auth.command()
def sync():
    """同步 Token（1 秒完成）"""
    token = click.prompt("👉 请粘贴 MYTOKEN")
    if token and len(token) > 50:
        save_token(token)
        click.echo("✅ 登录成功！以后不用再粘了")
    else:
        click.echo("❌ Token 格式错误")

@auth.command()
def status():
    """查看登录状态"""
    click.echo("✅ 已登录" if load_token() else "❌ 未登录")

@auth.command()
def logout():
    """退出登录"""
    if TOKEN_FILE.exists():
        os.remove(TOKEN_FILE)
        click.echo("✅ 已退出")

# ====================== 业务命令：只返回10条 ======================
@cli.command("list_stations")
def list_stations():
    """获取站点列表（只显示2条，不刷屏）"""
    url = f"{BASE_URL}/substation/stations"
    params = {
        "powerId": "stationManageTable",
        "pageNum": 1,
        "pageSize": 2,  # 🔥 固定2条，不刷屏
        "sort": ""
    }
    data = {"params": {}}

    try:
        res = requests.post(url, headers=get_headers(), params=params, json=data, timeout=15)
        result = res.json()

        # 只保留前2条
        if "data" in result and "list" in result["data"]:
            result["data"]["list"] = result["data"]["list"][:2]

        print(json.dumps(result, ensure_ascii=False, indent=2))
    except Exception as e:
        print(f"请求失败：{e}")

if __name__ == "__main__":
    cli()