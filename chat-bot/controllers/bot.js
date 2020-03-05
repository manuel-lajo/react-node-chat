const axios = require('axios');
const neatCsv = require('neat-csv');
const amqp = require('amqplib/callback_api');

const STOCK_QUEUE = 'stockQueue';

exports.getStock = (req, res) => {
  const { stockCode } = req.query;

  // call stock API
  axios.get(`https://stooq.com/q/l/?s=${stockCode}&f=sd2t2ohlcv&h&e=csv`)
  .then(response => {
    return neatCsv(response.data);
  })
  .then(csvContent => {
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

        const queue = STOCK_QUEUE;
        let msg;
        if (closeValue === 'N/D') {
          msg = `Error: there was a problem with received stock_code: ${stockCode}`;
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
    amqp.connect('amqp://localhost', function(errorConnection, connection) {
      if (errorConnection) {
        throw errorConnection;
      }

      connection.createChannel(function(errorChannel, channel) {
        if (errorChannel) {
          throw errorChannel;
        }

        const queue = STOCK_QUEUE;
        channel.assertQueue(queue, { durable: false });

        channel.consume(queue, function(msg) {
            connection.close();
            res.status(200).json({ botResponse: msg.content.toString() });
          },
          { noAck: true }
        );

      });
    });

  })
  .catch(error => {
    console.log(error);
  });
};
