const { spawn, execSync } = require('child_process');
const path = require('path');

// 获取项目根目录
const projectRoot = path.resolve(__dirname, '..');

// 启动Docker容器
console.log('正在启动Docker容器...');
try {
  execSync('docker-compose -f docker-compose.dev.yml up -d', {
    stdio: 'inherit',
    cwd: projectRoot
  });
  console.log('Docker容器启动成功！');
} catch (error) {
  console.error('Docker容器启动失败：', error.message);
  process.exit(1);
}

// 等待MySQL容器完全启动
console.log('等待MySQL服务就绪...');
setTimeout(() => {
  // 启动NestJS应用
  console.log('正在启动NestJS应用...');
  const nestProcess = spawn('pnpm', ['start:dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: projectRoot
  });

  nestProcess.on('error', (error) => {
    console.error('NestJS应用启动失败：', error.message);
    process.exit(1);
  });

  // 处理进程退出
  process.on('SIGINT', () => {
    console.log('\n正在关闭服务...');
    nestProcess.kill();
    execSync('docker-compose -f docker-compose.dev.yml down', {
      stdio: 'inherit',
      cwd: projectRoot
    });
    process.exit(0);
  });
}, 10000); // 等待10秒确保MySQL完全启动