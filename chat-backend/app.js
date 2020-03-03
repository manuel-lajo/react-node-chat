const express = require('express');
const bodyParser = require('body-parser');
const io = require('./socket');

const app = express();

app.use(bodyParser.json());

// review headers and method access
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  next();
})

const messageRoutes = require('./routes/message');

app.use('/messages', messageRoutes);

const server = app.listen(7000);
io.init(server);
