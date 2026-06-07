import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npm = isWindows ? 'npm.cmd' : 'npm';

const processes = [
  ['api', ['run', 'dev:server']],
  ['web', ['run', 'dev:client']]
];

for (const [label, args] of processes) {
  const child = spawn(npm, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true
  });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[${label}] ${chunk}`);
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[${label}] ${chunk}`);
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
    }
  });
}

process.on('SIGINT', () => {
  for (const child of process._getActiveHandles()) {
    if (child?.kill) child.kill('SIGINT');
  }
  process.exit(0);
});
