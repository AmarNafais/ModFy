import { Client } from 'ssh2';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import dotenv from 'dotenv';

const execAsync = promisify(exec);

// Load environment variables
dotenv.config();

interface Config {
  LIVE_SSH_HOST: string;
  LIVE_SSH_PASS: string;
  LIVE_DB_NAME: string;
  LIVE_DB_USER: string;
  LIVE_DB_PASS: string;
  DB_HOST: string;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
}

// Colors for terminal output
const Colors = {
  GREEN: '\x1b[92m',
  RED: '\x1b[91m',
  YELLOW: '\x1b[93m',
  BLUE: '\x1b[94m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m'
};

function printColored(message: string, color: string): void {
  console.log(`${color}${message}${Colors.RESET}`);
}

function getFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

async function findMysqlPath(): Promise<string> {
  const possiblePaths = [
    'C:\\xampp\\mysql\\bin',
    'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin',
    'C:\\Program Files (x86)\\MySQL\\MySQL Server 8.0\\bin'
  ];
  
  for (const mysqlPath of possiblePaths) {
    if (fs.existsSync(path.join(mysqlPath, 'mysql.exe'))) {
      return mysqlPath;
    }
  }
  
  throw new Error('MySQL not found. Please install XAMPP or MySQL.');
}

function validateConfig(config: Partial<Config>): config is Config {
  const required: (keyof Config)[] = [
    'LIVE_SSH_HOST',
    'LIVE_SSH_PASS',
    'LIVE_DB_NAME',
    'LIVE_DB_USER',
    'LIVE_DB_PASS',
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD'
  ];
  
  const missing = required.filter(key => !config[key]);
  
  if (missing.length > 0) {
    printColored(`❌ Missing required environment variables: ${missing.join(', ')}`, Colors.RED);
    return false;
  }
  
  return true;
}

async function exportFromLive(config: Config, dumpFile: string): Promise<boolean> {
  return new Promise((resolve) => {
    console.log('📤 Exporting database from live server...');
    
    // Parse SSH host
    const [sshUser, sshHost] = config.LIVE_SSH_HOST.includes('@')
      ? config.LIVE_SSH_HOST.split('@')
      : ['root', config.LIVE_SSH_HOST];
    
    if (!sshHost) {
      printColored('❌ Invalid LIVE_SSH_HOST format. Use: user@hostname', Colors.RED);
      resolve(false);
      return;
    }
    
    const conn = new Client();
    const writeStream = fs.createWriteStream(dumpFile);
    
    conn.on('ready', () => {
      console.log('   Connected to server');
      console.log('   Running mysqldump...');
      
      const mysqldumpCmd = `mysqldump -u ${config.LIVE_DB_USER} -p'${config.LIVE_DB_PASS}' ${config.LIVE_DB_NAME} --single-transaction --quick --lock-tables=false --no-tablespaces`;
      
      conn.exec(mysqldumpCmd, (err, stream) => {
        if (err) {
          printColored(`❌ Failed to execute mysqldump: ${err.message}`, Colors.RED);
          conn.end();
          resolve(false);
          return;
        }
        
        let hasError = false;
        
        stream.on('close', (code: number) => {
          conn.end();
          writeStream.end();
          
          if (code === 0 && !hasError && fs.existsSync(dumpFile) && fs.statSync(dumpFile).size > 0) {
            printColored('✅ Database exported successfully', Colors.GREEN);
            resolve(true);
          } else {
            printColored('❌ Export failed', Colors.RED);
            resolve(false);
          }
        });
        
        stream.on('data', (data: Buffer) => {
          writeStream.write(data);
        });
        
        stream.stderr.on('data', (data: Buffer) => {
          const errorText = data.toString();
          if (errorText.toLowerCase().includes('error') && !errorText.includes('Warning')) {
            hasError = true;
            console.error(`   Error: ${errorText}`);
          }
        });
      });
    });
    
    conn.on('error', (err) => {
      printColored(`❌ SSH connection error: ${err.message}`, Colors.RED);
      resolve(false);
    });
    
    console.log(`   Connecting to ${sshHost}...`);
    conn.connect({
      host: sshHost,
      port: 22,
      username: sshUser,
      password: config.LIVE_SSH_PASS,
      readyTimeout: 30000
    });
  });
}

async function importToLocal(config: Config, dumpFile: string, mysqlPath: string): Promise<boolean> {
  console.log('\n📥 Importing to local database...');
  
  try {
    // Drop existing database
    console.log('   Dropping existing database...');
    const dropCmd = `"${path.join(mysqlPath, 'mysql.exe')}" -h ${config.DB_HOST} -u ${config.DB_USER} -p${config.DB_PASSWORD} -e "DROP DATABASE IF EXISTS ${config.DB_NAME};"`;
    await execAsync(dropCmd);
    
    // Create new database
    console.log('   Creating new database...');
    const createCmd = `"${path.join(mysqlPath, 'mysql.exe')}" -h ${config.DB_HOST} -u ${config.DB_USER} -p${config.DB_PASSWORD} -e "CREATE DATABASE ${config.DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"`;
    await execAsync(createCmd);
    
    // Import dump file
    console.log('   Importing data...');
    const importCmd = `"${path.join(mysqlPath, 'mysql.exe')}" -h ${config.DB_HOST} -u ${config.DB_USER} -p${config.DB_PASSWORD} ${config.DB_NAME} < "${dumpFile}"`;
    await execAsync(importCmd);
    
    printColored('✅ Database imported successfully', Colors.GREEN);
    return true;
  } catch (error) {
    printColored(`❌ Import failed: ${error instanceof Error ? error.message : String(error)}`, Colors.RED);
    return false;
  }
}

async function verifyImport(config: Config, mysqlPath: string): Promise<boolean> {
  console.log('\n🔍 Verifying import...');
  
  try {
    const verifyCmd = `"${path.join(mysqlPath, 'mysql.exe')}" -h ${config.DB_HOST} -u ${config.DB_USER} -p${config.DB_PASSWORD} ${config.DB_NAME} -e "SHOW TABLES;"`;
    const { stdout } = await execAsync(verifyCmd);
    
    const tables = stdout.split('\n').filter(line => line.trim() && !line.includes('Tables_in_'));
    console.log(`   Found ${tables.length} tables`);
    
    printColored('✅ Import verified successfully', Colors.GREEN);
    return true;
  } catch (error) {
    printColored(`❌ Verification failed: ${error instanceof Error ? error.message : String(error)}`, Colors.RED);
    return false;
  }
}

async function main(): Promise<number> {
  console.log(`${Colors.BOLD}${Colors.BLUE}╔════════════════════════════════════════════╗`);
  console.log(`║  Database Sync: Live → Local               ║`);
  console.log(`╚════════════════════════════════════════════╝${Colors.RESET}\n`);
  
  // Validate configuration
  const config: Partial<Config> = {
    LIVE_SSH_HOST: process.env.LIVE_SSH_HOST,
    LIVE_SSH_PASS: process.env.LIVE_SSH_PASS,
    LIVE_DB_NAME: process.env.LIVE_DB_NAME,
    LIVE_DB_USER: process.env.LIVE_DB_USER,
    LIVE_DB_PASS: process.env.LIVE_DB_PASS,
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD
  };
  
  if (!validateConfig(config)) {
    console.log('\nPlease check your .env file and ensure all variables are set.');
    return 1;
  }
  
  // Find MySQL installation
  let mysqlPath: string;
  try {
    mysqlPath = await findMysqlPath();
    console.log(`✅ MySQL found at: ${mysqlPath}\n`);
  } catch (error) {
    printColored(`❌ ${error instanceof Error ? error.message : String(error)}`, Colors.RED);
    return 1;
  }
  
  const dumpFile = path.join(process.cwd(), 'temp_dump.sql');
  
  try {
    // Step 1: Export from live server
    const exportSuccess = await exportFromLive(config, dumpFile);
    if (!exportSuccess) {
      return 1;
    }
    
    const fileSize = fs.statSync(dumpFile).size;
    console.log(`   Dump file size: ${getFileSize(fileSize)}`);
    
    // Step 2: Import to local database
    const importSuccess = await importToLocal(config, dumpFile, mysqlPath);
    if (!importSuccess) {
      return 1;
    }
    
    // Step 3: Verify import
    const verifySuccess = await verifyImport(config, mysqlPath);
    if (!verifySuccess) {
      return 1;
    }
    
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    if (fs.existsSync(dumpFile)) {
      fs.unlinkSync(dumpFile);
      console.log('   Removed temporary dump file');
    }
    
    printColored(`\n${'='.repeat(50)}`, Colors.GREEN);
    printColored('✅ Database sync completed successfully!', Colors.GREEN);
    printColored(`${'='.repeat(50)}\n`, Colors.GREEN);
    
    return 0;
  } catch (error) {
    printColored(`\n❌ Unexpected error: ${error instanceof Error ? error.message : String(error)}`, Colors.RED);
    
    // Cleanup on error
    if (fs.existsSync(dumpFile)) {
      fs.unlinkSync(dumpFile);
    }
    
    return 1;
  }
}

// Run the script
main().then(code => process.exit(code));
