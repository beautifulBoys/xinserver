
#! /bin/bash 

# 命令字符串
cmdStr="$1"

projectName=$(node -p "require('./package.json').name")
version=$(node -p "require('./package.json').version")
workers=$(node -p "require('./data/config.json').workers || 1")

echo "名称:$projectName , 版本号:$version , 命令:$cmdStr , 进程数:$workers"

if [ -z "$cmdStr" ]; then
  echo "Error: No command provided."
  exit 1
fi

if [ "$cmdStr" == 'dev' ];then
  echo '启动开发服务'
  MONGO_NAME=mongo SERVER_NAME="$projectName" SERVER_PORT=7001 egg-bin dev --port=7001 --workers=1
elif [ "$cmdStr" == 'start' ];then
  echo '服务器启动服务'
  egg-scripts start --port=80 --workers="$workers" --title="$projectName"
elif [ "$cmdStr" == 'local-start' ];then
  echo '本地启动服务'
  egg-scripts start --workers=4 --title="$projectName"
elif [ "$cmdStr" == 'stop' ];then
  echo '服务器停止服务'
  egg-scripts stop --title="$projectName"
elif [ "$cmdStr" == 'build' ];then
  echo '编译代码中'
  node ./scripts/compress.js
  # mkdir -p ./dist
  # cp -r ./app/* ./dist/
elif [ "$cmdStr" == 'docker-build' ];then
  echo '打包docker镜像'
  rm -rf ./dist
  npm run build
  echo '编译成功，正在打包Docker'
  docker build -t "$projectName:$version" .
  # rm -rf ./dist
  echo '打包镜像成功'
elif [ "$cmdStr" == 'docker-save' ];then
  echo '将镜像保存到本地'
  docker save "$projectName:$version" | gzip > "../$projectName.tar.gz"
  echo '保存镜像到本地成功'
elif [ "$cmdStr" == 'docker-publish' ];then
  echo '镜像发布：打包docker镜像，并保存到本地'
  docker build -t "$projectName:$version" .
  echo '打包镜像成功，正在保存到本地'
  docker save "$projectName:$version" | gzip > "./$projectName.tar.gz"
  echo '保存镜像到本地成功'
else
  echo "错误命令：$cmdStr"

fi




