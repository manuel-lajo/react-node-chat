const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
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

const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/message');

app.use('/auth', authRoutes);
app.use('/messages', messageRoutes);

// main error handler
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});


mongoose
  .connect(
  'mongodb+srv://new-user_27:cG2Q3dPnpEp9Pgtr@cluster0-lnlel.mongodb.net/chatDB?retryWrites=true&w=majority'
  )
  .then(result => {
    const server = app.listen(7000);
    io.init(server);
  })
  .catch(error => {
    console.log(error);
  });
