
#!/bin/bash
set -euo pipefail

# ----------------------------
# 输入参数：备份文件名
# ----------------------------
FILENAME="${1:-}"

if [ -z "$FILENAME" ]; then
    echo "❌ 请输入备份文件名，例如：project_20250101103248_backup.tar.gz"
    exit 1
fi

# ----------------------------
# 容器内部路径（已通过 docker-compose 映射）
# ----------------------------
PROJECT_BACKUP_DIR="/app/resource/backup/project" # 容器内部
PROJECT_DIR="/xinserver" # 容器内部

# ----------------------------
# 准备临时目录
# ----------------------------
mkdir -p "$PROJECT_BACKUP_DIR"

# ----------------------------
# 开始备份
# ----------------------------
echo "📦 开始备份项目 ..."

# 删除文件
rm -f "${PROJECT_BACKUP_DIR}/${FILENAME}"
# 打包
BACKUP_DIR="resource/backup" # 容器内部
tar -czvf "${PROJECT_BACKUP_DIR}/${FILENAME}" -C "$PROJECT_DIR" --exclude="$BACKUP_DIR" .
# tar -czvf "/app/resource/backup/project/xinserver_2023343_backup.tar.gz" -C "/xinserver" --exclude="resource/backup" .
# tar -czvf "${PROJECT_BACKUP_DIR}/${FILENAME}" -C "$PROJECT_DIR" .

echo "✅ 数据库备份成功！"
echo "📁 输出文件：${PROJECT_BACKUP_DIR}/${FILENAME}"
