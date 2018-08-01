const express = require('express');
const path = require('path');
const { MongoClient } = require('mongodb')
const config = require('./config')
const router = require('./router')
const app = express();

let db;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

MongoClient.connect(config.dbHost, (err, client) => {
  if (err) {
		throw err;
	} else {
    db = client.db(config.dbName);
    console.log('API connected to mongodb')
  }
})

// make DB available to all routes
const exposeDb = (req, res, next) => {
	req.db = db
	next()
}

app.use('/api', exposeDb, router)

app.get('*', (req, res) => {
  res.sendFile(path.join(`${__dirname}/client/build/index.html`));
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server listening on ${port}`));

