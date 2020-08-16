module.exports = {
  host: process.env.DB_HOST,
  port: process.env.PORT,
  dbName: process.env.DB_NAME,
  dbUser: process.env.DB_USERNAME,
  dbPassword: process.env.DB_PASSWORD,
  limit: 3,
  firebase: {
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
  },
}
