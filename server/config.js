module.exports = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.PORT || 5000,
  dbName: process.env.DB_NAME || 'meeting',
  dbUser: process.env.DB_USERNAME || 'root',
  dbPassword: process.env.DB_PASSWORD || 'root',
  limit: 3
}
