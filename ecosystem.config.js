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
      DB_USER: "mysql",
      DB_PASSWORD: "vR6G7s365Ntqpw38ytW7Yds83QuoSgHgyEVD6ZGtL1QDGKPgRfS6vwJtT2CKzrd5", // Make sure this matches your MySQL password
      DB_NAME: "modfy"
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "1G"
  }]
};