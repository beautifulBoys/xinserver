'use strict';
const fs = require('fs')
const axios = require('axios')
const os = require('os')
const { execSync } = require('child_process')
const BaseService = require('../../core/baseService')

class XinService extends BaseService {

  async info (data = {}) {
    function getDiskInfo () {
      try {
        // -h 可读格式，tail -1 取总行
        const path = fs.existsSync("/host/root") ? "/host/root" : "/";
        const output = execSync(`df -h ${path} | tail -1`, { encoding: 'utf8' }).trim()
        // 分割成数组
        const parts = output.split(/\s+/)
        return parts[1]
      } catch (e) {
        return 0
      }
    }

    const diskTotal = getDiskInfo()

    const result = {
      diskTotal: parseFloat(diskTotal),
    }

    return result
  }

  async status (data = {}) {
    async function _getCpuUsage() {
      // 读取逻辑核数
      const cpus1 = os.cpus();
      const cores = cpus1.length;

      return new Promise(resolve => {
        setTimeout(() => {
          const cpus2 = os.cpus();
          let idleDiff = 0;
          let totalDiff = 0;

          for (let i = 0; i < cpus1.length; i++) {
            const t1 = cpus1[i].times;
            const t2 = cpus2[i].times;
            const idle = t2.idle - t1.idle;
            const total =
              (t2.user - t1.user) +
              (t2.nice - t1.nice) +
              (t2.sys - t1.sys) +
              (t2.irq - t1.irq) +
              idle;
            idleDiff += idle;
            totalDiff += total;
          }

          if (totalDiff === 0) return resolve({ total: cores, used: 0, text: `0.0 / ${cores} 核` });

          const usageFraction = 1 - idleDiff / totalDiff;
          const usedCores = usageFraction * cores;

          resolve({
            total: cores,
            used: Number(usedCores.toFixed(1)),
            text: `（${usedCores.toFixed(1)} / ${cores}）核`
          });
        }, 100);
      });
    }

    // ------------------- 内存 -------------------
    function _getMemoryUsage() {
      let total, free;

      try {
        // 如果挂载了 /proc/meminfo，可以读取宿主机内存
        const meminfo = fs.readFileSync('/host/proc/meminfo', 'utf8');
        const totalMatch = meminfo.match(/^MemTotal:\s+(\d+) kB/m);
        const freeMatch = meminfo.match(/^MemAvailable:\s+(\d+) kB/m) || meminfo.match(/^MemFree:\s+(\d+) kB/m);
        total = totalMatch ? parseInt(totalMatch[1], 10) * 1024 : os.totalmem();
        free = freeMatch ? parseInt(freeMatch[1], 10) * 1024 : os.freemem();
      } catch {
        total = os.totalmem();
        free = os.freemem();
      }

      const used = total - free;
      return {
        total,
        used,
        text: `（${(used / 1024 / 1024 / 1024).toFixed(1)} / ${(total / 1024 / 1024 / 1024).toFixed(1)}）GB`
      };
    }

    // ------------------- 系统负载 -------------------
    function _getLoadAverage() {
      const [load1] = os.loadavg();
      const cores = os.cpus().length;
      return {
        total: cores,
        used: load1,
        text: `（${Number(load1.toFixed(1))} / ${cores}）核`
      };
    }

    // ------------------- 磁盘 -------------------
    function _getDiskUsage() {
      try {
        const path = fs.existsSync("/host/root") ? "/host/root" : "/";
        const output = execSync(`df -h ${path} | tail -1`, { encoding: "utf8" }).trim();
        const parts = output.split(/\s+/);
        // parts[1]=总量, parts[2]=已用, parts[3]=可用, parts[4]=%
        const total = parseFloat(parts[1] || '0')
        const used = parseFloat(parts[2] || '0')
        return {
          total,
          used,
          text: `（${used} / ${total}）GB`
        };
      } catch {
        return { total: 0, used: 0, text: '（0 / 0）GB' };
      }
    }

    // ------------------- 聚合 -------------------
    const cpuUsage = await _getCpuUsage();
    const memUsage = _getMemoryUsage();
    const loadUsage = _getLoadAverage();
    const diskUsage = _getDiskUsage();

    return {
      cpuUsage: cpuUsage,
      memUsage: memUsage,
      loadUsage: loadUsage,
      diskUsage: diskUsage,
    };
  }

  // 系统负载
  async loadinfo (data = {}) {
    const [load1, load5, load15] = os.loadavg()
    const cores = os.cpus().length
    const avg = (load1 + load5 + load15) / 3
    const precent = ((avg / cores) * 100).toFixed(2) + '%'
    return {
      time: Date.now(),
      load1,
      load5,
      load15,
      cores,
      avg,
      precent,
    }
  }

  // CPU
  async cpuinfo (data = {}) {
    // 读取逻辑核数
    const cpus1 = os.cpus();
    const cores = cpus1.length;

    const result = await new Promise(resolve => {
      setTimeout(() => {
        const cpus2 = os.cpus();
        let idleDiff = 0;
        let totalDiff = 0;

        for (let i = 0; i < cpus1.length; i++) {
          const t1 = cpus1[i].times;
          const t2 = cpus2[i].times;
          const idle = t2.idle - t1.idle;
          const total =
            (t2.user - t1.user) +
            (t2.nice - t1.nice) +
            (t2.sys - t1.sys) +
            (t2.irq - t1.irq) +
            idle;
          idleDiff += idle;
          totalDiff += total;
        }

        if (totalDiff === 0) return resolve({ total: cores, used: 0, text: `0.0 / ${cores} 核` });

        const usageFraction = 1 - idleDiff / totalDiff;
        const usedCores = usageFraction * cores;

        resolve({
          time: Date.now(),
          total: cores,
          used: Number(usedCores.toFixed(1)),
          text: `（${usedCores.toFixed(1)} / ${cores}）核`
        });
      }, 100);
    });
    return result;
  }

  // 内存
  async memoryinfo (data = {}) {
    let total, free;

    try {
      // 如果挂载了 /proc/meminfo，可以读取宿主机内存
      const meminfo = fs.readFileSync('/host/proc/meminfo', 'utf8');
      const totalMatch = meminfo.match(/^MemTotal:\s+(\d+) kB/m);
      const freeMatch = meminfo.match(/^MemAvailable:\s+(\d+) kB/m) || meminfo.match(/^MemFree:\s+(\d+) kB/m);
      total = totalMatch ? parseInt(totalMatch[1], 10) * 1024 : os.totalmem();
      free = freeMatch ? parseInt(freeMatch[1], 10) * 1024 : os.freemem();
    } catch {
      total = os.totalmem();
      free = os.freemem();
    }

    const used = total - free;
    return {
      time: Date.now(),
      total,
      used,
      text: `（${(used / 1024 / 1024 / 1024).toFixed(1)} / ${(total / 1024 / 1024 / 1024).toFixed(1)}）GB`
    };
  }

  // 磁盘存储
  async diskinfo (data = {}) {
    try {
      // 自动识别主磁盘设备
      function detectDevice() {
        const partitions = fs.readFileSync('/host/proc/partitions', 'utf8')
          .split('\n')
          .map(l => l.trim())
          .filter(Boolean);

        // 可能的主设备
        const candidates = ['nvme0n1', 'sda', 'vda'];

        for (const line of partitions) {
          for (const dev of candidates) {
            if (line.endsWith(` ${dev}`)) {
              return dev;
            }
          }
        }

        // fallback：默认 sda
        return 'sda';
      }

      function parseDiskStats (device) {
        const data = fs.readFileSync('/host/proc/diskstats', "utf8");
        const line = data.split('\n').find(l => l.includes(` ${device} `));
        if (!line) return null;

        const p = line.trim().split(/\s+/);

        return {
          readIO: parseInt(p[3]),       // reads completed
          readSectors: parseInt(p[5]),  // sectors read
          writeIO: parseInt(p[7]),      // writes completed
          writeSectors: parseInt(p[9]), // sectors written
        };
      }
      const device = detectDevice();
      const a = parseDiskStats(device);
      await new Promise(r => setTimeout(r, 1000)); // 1 秒采样间隔
      const b = parseDiskStats(device);

      if (!a || !b) {
        return { device, error: '无法读取 diskstats，可能权限不足' };
      }

      const readIOPS = b.readIO - a.readIO;   // IOPS
      const writeIOPS = b.writeIO - a.writeIO;

      const readKBps = (b.readSectors - a.readSectors) * 512 / 1024;
      const writeKBps = (b.writeSectors - a.writeSectors) * 512 / 1024;

      return {
        time: Date.now(),
        device,
        readIOPS,
        writeIOPS,
        readKBps,
        writeKBps,
      };
    } catch {
      return {
        time: Date.now(),
        device: '无',
        readIOPS: 0,
        writeIOPS: 0,
        readKBps: 0,
        writeKBps: 0,
      };
    }
  }

  // 网络
  async networkinfo (data = {}) {
    try {
      function getNetBytes () {
        const data = fs.readFileSync('/proc/net/dev', 'utf8');
        const lines = data.split('\n');

        let rx = 0;
        let tx = 0;

        for (const line of lines) {
          if (line.includes(':')) {
            const [iface, stats] = line.split(':');
            const fields = stats.trim().split(/\s+/);

            if (iface.trim() === 'lo') continue; // 忽略 lo
            rx += parseInt(fields[0]); // 接收 bytes
            tx += parseInt(fields[8]); // 发送 bytes
          }
        }

        return { rx, tx };
      }

      let last = getNetBytes();
      let upload = 0;
      let download = 0;

      const resu = await new Promise(resolve => {
        setTimeout(() => {
          const cur = getNetBytes();
          upload = Number(((cur.tx - last.tx) / 1024).toFixed(2))
          download = Number(((cur.rx - last.rx) / 1024).toFixed(2))

          resolve({
            time: Date.now(),
            upload: upload,
            download: download,
          })
        }, 1000)
      })

      return resu
    } catch (err) {
      return {
        time: Date.now(),
        upload: 0,
        download: 0,
      }
    }
  }

}

module.exports = XinService
