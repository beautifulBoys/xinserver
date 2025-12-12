const fs = require('fs');
const path = require('path');
const obfuscator = require('javascript-obfuscator');
const { glob } = require('glob');

// 源目录和目标目录
const sourceDir = path.join(__dirname, '../xin');
const targetDir = path.join(__dirname, '../dist/xin');


// 确保目标目录存在，如果不存在则创建
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

glob(sourceDir + '/**/*.js', {}).then(files => {
  files.forEach(file => {
    const code = fs.readFileSync(file, 'utf8');
    const targetFile = path.join(targetDir, path.relative(sourceDir, file));

    if (file.includes('compressExclude')) {
    // if (file.includes('.js')) {
      // 此处做这个的目的就是为了过滤掉eval编译混淆的一个问题，
      fs.writeFileSync(targetFile, code, 'utf8');
    } else {
      // 使用 JavaScript Obfuscator 进行更深度的混淆
      const obfuscatedCode = obfuscator.obfuscate(code, {
        compact: true,
        reservedNames: [
          // '^state$',
          // '^values$',
        ],
        controlFlowFlattening: true,  // 控制流平坦化
        controlFlowFlatteningThreshold: 0.75,
        numbersToExpressions: true,  // 数字转为表达式
        simplify: true,
        stringArrayShuffle: true,  // 字符串数组混淆
        splitStrings: true,
        splitStringsChunkLength: 3,
        stringArrayThreshold: 0.75,
      }).getObfuscatedCode();


      const targetDirname = path.dirname(targetFile);
      if (!fs.existsSync(targetDirname)) {
        fs.mkdirSync(targetDirname, { recursive: true });
      }

      fs.writeFileSync(targetFile, obfuscatedCode, 'utf8');

      console.log(`Processed and saved: ${targetFile}`);
    }
  });
}).catch(err => {
  throw err
})
