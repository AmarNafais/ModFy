const { spawn } = require('child_process');
const path = require('path');

const pythonPath = path.resolve(process.cwd(), '.venv', 'Scripts', 'python.exe');
const scriptPath = path.resolve(process.cwd(), 'server', 'scripts', 'lowercase_and_upload_images.py');

console.log(`Using Python: ${pythonPath}`);
console.log(`Running script: ${scriptPath}`);

const child = spawn(pythonPath, [scriptPath], { stdio: 'inherit', shell: false });

child.on('exit', (code) => {
  process.exit(code ?? 1);
});
