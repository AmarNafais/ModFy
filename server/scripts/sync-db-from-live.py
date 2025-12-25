#!/usr/bin/env python3
"""
Database Sync Script - Export from Live and Import to Local
Usage: python sync-db-from-live.py
Note: Requires paramiko - install with: pip install paramiko
"""

import subprocess
import sys
import os
from datetime import datetime
from pathlib import Path

try:
    import paramiko
except ImportError:
    print("❌ Error: paramiko library not found")
    print("Install it with: pip install paramiko")
    sys.exit(1)

# Load environment variables from .env file
def load_env():
    env_path = Path(__file__).parent.parent.parent / '.env'
    if env_path.exists():
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()

load_env()

# Colors for Windows
class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    NC = '\033[0m'  # No Color

# Configuration - All values from .env file
LIVE_SSH_HOST = os.getenv("LIVE_SSH_HOST")
LIVE_SSH_PASS = os.getenv("LIVE_SSH_PASS")
LIVE_DB_NAME = os.getenv("LIVE_DB_NAME")
LIVE_DB_USER = os.getenv("LIVE_DB_USER")
LIVE_DB_PASS = os.getenv("LIVE_DB_PASS")

# Local configuration from .env file
LOCAL_DB_NAME = os.getenv("DB_NAME")
LOCAL_DB_USER = os.getenv("DB_USER")
LOCAL_DB_PASS = os.getenv("DB_PASSWORD", "")
LOCAL_DB_HOST = os.getenv("DB_HOST")

# XAMPP MySQL path detection
def find_mysql_path():
    """Find MySQL executable path for XAMPP"""
    possible_paths = [
        r"C:\xampp\mysql\bin\mysql.exe",
        r"C:\XAMPP\mysql\bin\mysql.exe",
        r"D:\xampp\mysql\bin\mysql.exe",
    ]
    
    for path in possible_paths:
        if os.path.exists(path):
            return path.replace('mysql.exe', '')
    
    # If not found, return empty string (will use system PATH)
    return ""

MYSQL_PATH = find_mysql_path()

def print_header():
    print("╔════════════════════════════════════════╗")
    print("║   DATABASE SYNC: LIVE → LOCAL        ║")
    print("╚════════════════════════════════════════╝")
    print()

def print_colored(text, color):
    print(f"{color}{text}{Colors.NC}")

def run_command(command, capture_output=False, shell=True):
    """Run a command and return success status"""
    try:
        if capture_output:
            result = subprocess.run(command, shell=shell, capture_output=True, text=True, check=True)
            return True, result.stdout
        else:
            result = subprocess.run(command, shell=shell, check=True)
            return True, None
    except subprocess.CalledProcessError as e:
        return False, str(e)

def get_file_size(filepath):
    """Get human-readable file size"""
    size = os.path.getsize(filepath)
    for unit in ['B', 'KB', 'MB', 'GB']:
        if size < 1024.0:
            return f"{size:.2f} {unit}"
        size /= 1024.0
    return f"{size:.2f} TB"

def main():
    print_header()
    
    # Validate required environment variables
    required_vars = {
        'LIVE_SSH_HOST': LIVE_SSH_HOST,
        'LIVE_SSH_PASS': LIVE_SSH_PASS,
        'LIVE_DB_NAME': LIVE_DB_NAME,
        'LIVE_DB_USER': LIVE_DB_USER,
        'LIVE_DB_PASS': LIVE_DB_PASS,
        'DB_NAME': LOCAL_DB_NAME,
        'DB_USER': LOCAL_DB_USER,
        'DB_HOST': LOCAL_DB_HOST
    }
    
    missing_vars = [key for key, value in required_vars.items() if not value]
    if missing_vars:
        print_colored(f"❌ Missing required environment variables in .env file:", Colors.RED)
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease add them to your .env file")
        return 1
    
    # Generate dump filename with timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    dump_file = f"modfy_live_backup_{timestamp}.sql"
    
    print_colored("⚠️  WARNING: This will REPLACE your local database!", Colors.YELLOW)
    print(f"Live DB: {LIVE_DB_NAME} @ {LIVE_SSH_HOST}")
    print(f"Local DB: {LOCAL_DB_NAME} @ {LOCAL_DB_HOST}")
    print()
    
    response = input("Continue? (yes/no): ").strip().lower()
    print()
    
    if response not in ['yes', 'y']:
        print("❌ Cancelled.")
        return 0
    
    # Step 1: Export from live server
    print("📤 Exporting database from live server...")
    
    try:
        # Parse SSH host and username
        if '@' in LIVE_SSH_HOST:
            ssh_user, ssh_host = LIVE_SSH_HOST.split('@')
        else:
            print_colored("❌ Invalid LIVE_SSH_HOST format. Use: user@hostname", Colors.RED)
            return 1
        
        # Create SSH client
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        print(f"   Connecting to {ssh_host}...")
        ssh.connect(ssh_host, username=ssh_user, password=LIVE_SSH_PASS, timeout=30)
        
        print(f"   Running mysqldump on remote server...")
        mysqldump_cmd = f"mysqldump -u {LIVE_DB_USER} -p'{LIVE_DB_PASS}' {LIVE_DB_NAME} --single-transaction --quick --lock-tables=false --no-tablespaces"
        
        stdin, stdout, stderr = ssh.exec_command(mysqldump_cmd)
        
        # Write output to file
        with open(dump_file, 'wb') as f:
            for line in stdout:
                f.write(line.encode('utf-8') if isinstance(line, str) else line)
        
        # Check for errors
        error_output = stderr.read().decode()
        if error_output and "error" in error_output.lower():
            print_colored(f"❌ mysqldump error: {error_output}", Colors.RED)
            ssh.close()
            return 1
        
        ssh.close()
        
    except paramiko.AuthenticationException:
        print_colored("❌ SSH Authentication failed. Check LIVE_SSH_PASS", Colors.RED)
        return 1
    except paramiko.SSHException as e:
        print_colored(f"❌ SSH connection error: {str(e)}", Colors.RED)
        return 1
    except Exception as e:
        print_colored(f"❌ Error during export: {str(e)}", Colors.RED)
        return 1
    
    if not os.path.exists(dump_file) or os.path.getsize(dump_file) == 0:
        print_colored("❌ Export failed - dump file is empty or missing", Colors.RED)
        return 1
    
    print_colored("✅ Database exported successfully", Colors.GREEN)
    file_size = get_file_size(dump_file)
    print(f"   File size: {file_size}")
    
    # Step 2: Drop and recreate local database
    print()
    print("🗑️  Dropping local database...")
    
    mysql_cmd = f'{MYSQL_PATH}mysql'
    password_flag = f'-p{LOCAL_DB_PASS}' if LOCAL_DB_PASS else ''
    
    drop_command = f'{mysql_cmd} -u {LOCAL_DB_USER} {password_flag} -h {LOCAL_DB_HOST} -e "DROP DATABASE IF EXISTS {LOCAL_DB_NAME}; CREATE DATABASE {LOCAL_DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"'
    
    success, _ = run_command(drop_command)
    if not success:
        print_colored("❌ Failed to prepare local database", Colors.RED)
        if os.path.exists(dump_file):
            os.remove(dump_file)
        return 1
    
    print_colored("✅ Local database prepared", Colors.GREEN)
    
    # Step 3: Import to local
    print()
    print("📥 Importing database to local...")
    import_command = f'{mysql_cmd} -u {LOCAL_DB_USER} {password_flag} -h {LOCAL_DB_HOST} {LOCAL_DB_NAME} < {dump_file}'
    
    success, _ = run_command(import_command)
    if not success:
        print_colored("❌ Failed to import database", Colors.RED)
        if os.path.exists(dump_file):
            os.remove(dump_file)
        return 1
    
    print_colored("✅ Database imported successfully", Colors.GREEN)
    
    # Step 4: Verify import
    print()
    print("🔍 Verifying import...")
    verify_command = f'{mysql_cmd} -u {LOCAL_DB_USER} {password_flag} -h {LOCAL_DB_HOST} {LOCAL_DB_NAME} -e "SHOW TABLES;"'
    
    success, output = run_command(verify_command, capture_output=True)
    if success and output:
        table_count = len(output.strip().split('\n')) - 1  # Subtract header
        print(f"   Tables imported: {table_count}")
    
    # Step 5: Clean up
    print()
    print("🧹 Cleaning up...")
    if os.path.exists(dump_file):
        os.remove(dump_file)
        print_colored("✅ Temporary file removed", Colors.GREEN)
    
    # Summary
    print()
    print("╔════════════════════════════════════════╗")
    print("║          SYNC COMPLETED               ║")
    print("╚════════════════════════════════════════╝")
    print()
    print_colored("✅ Database synced successfully!", Colors.GREEN)
    if success and output:
        print(f"   Tables: {table_count}")
    print()
    print("💡 Next steps:")
    print("   1. Restart your dev server: npm run dev")
    print("   2. Run migrations if needed: npm run db:migrate")
    print("   3. Update images: npm run update-images")
    print()
    
    return 0

if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        print()
        print_colored("❌ Cancelled by user", Colors.YELLOW)
        sys.exit(1)
    except Exception as e:
        print_colored(f"❌ Error: {str(e)}", Colors.RED)
        sys.exit(1)
