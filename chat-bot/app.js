const express = require('express');
const request = require('request');
const neatCsv = require('neat-csv');
const amqp = require('amqplib/callback_api');

const app = express();

// review headers and method access
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  next();
})

app.get('/stock', (req, res, next) => {
  const { stockCode } = req.query;

  // call stock API
  request(`https://stooq.com/q/l/?s=${stockCode}&f=sd2t2ohlcv&h&e=csv`, async (error, response, body) => {
    if (error) {
      throw error;
    }

    const csvContent = await neatCsv(body);
    const closeValue = csvContent[0].Close;

    // receiver
    amqp.connect('amqp://localhost', function(errorConnection, connection) {
      if (errorConnection) {
        throw errorConnection;
      }

      connection.createChannel(function(errorChannel, channel) {
        if (errorChannel) {
          throw errorChannel;
        }

        const queue = 'stockQueue';
        let msg;
        if (closeValue === 'N/D') {
          msg = `Error: there was an error with received stock_code: ${stockCode}`;
        } else {
          msg = `${stockCode.toUpperCase()} quote is $${closeValue} per share`;
        }
        channel.assertQueue(queue, { durable: false });

        channel.sendToQueue(queue, Buffer.from(msg));
      });

      setTimeout(function() {
        connection.close();
      }, 500);
    });

    // sender
    amqp.connect("amqp://localhost", function(errorConnection, connection) {
      if (errorConnection) {
        throw errorConnection;
      }

      connection.createChannel(function(errorChannel, channel) {
        if (errorChannel) {
          throw errorChannel;
        }

        const queue = "stockQueue";
        channel.assertQueue(queue, { durable: false });

        channel.consume(queue, function(msg) {
            connection.close();
            res.status(200).json({ botResponse: msg.content.toString() });
          },
          { noAck: true }
        );

      });
    });

  });

});


app.listen(8000);
