const express = require('express');
// const axios = require('axios');
// const neatCsv = require('neat-csv');
// const amqp = require('amqplib/callback_api');

const app = express();

// review headers and method access
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  next();
})

// app.get('/stock', (req, res, next) => {
// });

const botRoutes = require('./routes/bot');

app.use('/stock', botRoutes);


app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});


app.listen(8000);
