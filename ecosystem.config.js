import dotenv from 'dotenv';
dotenv.config();

export default {
  apps: [{
    name: "modfy-server",
    script: "./server/index.ts",
    interpreter: "node",
    interpreter_args: "-r ts-node/register",
    env: {
      NODE_ENV: process.env.NODE_ENV || "production",
      PORT: process.env.PORT || 3000,
      DB_HOST: process.env.DB_HOST || "127.0.0.1",
      DB_USER: process.env.DB_USER,
      DB_PASSWORD: process.env.DB_PASSWORD,
      DB_NAME: process.env.DB_NAME || "modfy",
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT || "587",
      SMTP_SECURE: process.env.SMTP_SECURE || "false",
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASS: process.env.SMTP_PASS,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G"
  }]
};