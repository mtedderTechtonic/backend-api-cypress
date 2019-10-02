// server setup and connection
const express = require('express');
const http = require('http');

// middleware
const cors = require('cors');
const bodyParser = require('body-parser');

// controllers
const LibraryController = require('./controllers/LibraryController');
const AuthController = require('./controllers/AuthController');

const app = express();
const port = process.env.SERVER_PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// define controller routes
app.use('/library', LibraryController);
app.use('/auth', AuthController);

// create server
http.createServer(app).listen(port, () => {
  console.log(`Library RESTful API Service listening on port ${port}`);
});

module.exports = { app };
