import os from 'os';
import path from 'path';
import fs from 'fs';
import { spawn, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const appName = process.platform === 'win32' ? 'markdown-app.exe' : 'markdown-app';
const appPath = path.join(projectRoot, 'src-tauri', 'target', 'debug', appName);

let tauriDriver;
let exit = false;
let e2eRootDir;

function closeTauriDriver() {
  exit = true;
  tauriDriver?.kill();
}

function onShutdown(fn) {
  const cleanup = () => {
    try {
      fn();
    } finally {
      process.exit();
    }
  };
  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('SIGHUP', cleanup);
  process.on('SIGBREAK', cleanup);
}

onShutdown(() => {
  closeTauriDriver();
});

export const config = {
  host: '127.0.0.1',
  port: 4444,
  specs: [path.join(__dirname, 'specs', '**', '*.js')],
  maxInstances: 1,
  capabilities: [
    {
      maxInstances: 1,
      'tauri:options': {
        application: appPath,
      },
    },
  ],
  reporters: ['spec'],
  framework: 'mocha',
  mochaOpts: {
    ui: 'bdd',
    timeout: 60000,
  },
  onPrepare: () => {
    spawnSync(
      'npm',
      ['run', 'tauri', 'build', '--', '--debug', '--no-bundle'],
      {
        cwd: projectRoot,
        stdio: 'inherit',
        shell: true,
        env: { ...process.env, CI: '' },
      }
    );
    e2eRootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'markdown-app-e2e-'));
    const subfolder = path.join(e2eRootDir, 'notes');
    fs.mkdirSync(subfolder, { recursive: true });
    fs.writeFileSync(path.join(subfolder, 'readme.md'), '# Hello\n');
    process.env.MARKDOWN_APP_ROOT = e2eRootDir;
  },
  beforeSession: () => {
    tauriDriver = spawn(
      path.resolve(os.homedir(), '.cargo', 'bin', 'tauri-driver'),
      [],
      { stdio: [null, process.stdout, process.stderr], env: { ...process.env, MARKDOWN_APP_ROOT: e2eRootDir } }
    );
    tauriDriver.on('error', (error) => {
      console.error('tauri-driver error:', error);
      process.exit(1);
    });
    tauriDriver.on('exit', (code) => {
      if (!exit) {
        console.error('tauri-driver exited with code:', code);
        process.exit(1);
      }
    });
  },
  afterSession: () => {
    closeTauriDriver();
    if (e2eRootDir && fs.existsSync(e2eRootDir)) {
      try {
        fs.rmSync(e2eRootDir, { recursive: true });
      } catch (_) {}
    }
  },
};
