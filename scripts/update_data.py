import requests
import json
from datetime import datetime
import os

# 国家统计局API接口（示例）
DATA_URL = "https://data.stats.gov.cn/easyquery.htm"

def fetch_deposit_data():
    """获取居民存款数据"""
    # 注意：实际使用时需要根据国家统计局API调整
    # 这里提供框架，具体API参数需查阅官方文档
    data = {
        "last_update": datetime.now().strftime("%Y-%m-%d"),
        "deposits": []
    }
    
    # 手动初始化过去10年数据（首次运行）
    # 后续可通过API自动更新
    return data

def update_json_file(data, filepath="data/deposit_data.json"):
    """更新JSON数据文件"""
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    # 提交更改
    os.system("git config user.name 'github-actions[bot]'")
    os.system("git config user.email 'github-actions[bot]@users.noreply.github.com'")
    os.system("git add data/deposit_data.json")
    os.system("git commit -m 'auto: 更新存款数据'")
    os.system("git push")

if __name__ == "__main__":
    data = fetch_deposit_data()
    update_json_file(data)
