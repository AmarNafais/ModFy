export default {
  apps: [{
    name: "modfy-server",
    script: "./server/index.ts",
    interpreter: "node",
    interpreter_args: "-r ts-node/register",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
      DB_HOST: "127.0.0.1",
      DB_USER: "root",
      DB_PASSWORD: "Complex123", // Make sure this matches your MySQL password
      DB_NAME: "modfy"
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G"
  }]
};