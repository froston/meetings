module.exports = {
  host: process.env.CLEARDB_DATABASE_URL || 'localhost',
  port: process.env.PORT || 5000,
  dbName: process.env.CLEARDB_DATABASE_NAME || 'meeting',
  dbUser: process.env.CLEARDB_DATABASE_USERNAME || 'root',
  dbPassword: process.env.CLEARDB_DATABASE_PASSWORD || 'root',
  limit: 3
}
