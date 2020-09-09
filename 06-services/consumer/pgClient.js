const { Client: PgClient } = require("pg");

const pgClient = new PgClient({
  user: process.env.POSTGRES_USER || "alphaone",
  host: process.env.HOST || "postgresql-service",
  database: process.env.POSTGRES_USER || "alphaone",
  password: process.env.POSTGRES_PASSWORD || "securityisoverrated",
  port: 5432,
});

module.exports = pgClient;
