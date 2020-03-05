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
    amqp.connect('amqp://localhost', (errorConnection, connection) => {
      if (errorConnection) {
        const error = new Error(errorConnection.message || 'There was an error with receiver amqp connect method.');
        error.statusCode = errorConnection || 500;
        throw error;
      }

      connection.createChannel((errorChannel, channel) => {
        if (errorChannel) {
          const error = new Error(errorChannel.message || 'There was an error with receiver createChannel method.');
          error.statusCode = errorChannel || 500;
          throw error;
        }

        const queue = STOCK_QUEUE;
        channel.assertQueue(queue, { durable: false });

        let msg = closeValue === 'N/D'
          ? `Error: there was a problem with received stock_code: ${stockCode}.`
          : `${stockCode.toUpperCase()} quote is $${closeValue} per share`;

        channel.sendToQueue(queue, Buffer.from(msg));
      });

      setTimeout(() => {
        connection.close();
      }, 500);
    });

    // sender
    amqp.connect('amqp://localhost', (errorConnection, connection) => {
      if (errorConnection) {
        const error = new Error(errorConnection.message || 'There was an error with sender amqp connect method.');
        error.statusCode = errorConnection || 500;
        throw error;
      }

      connection.createChannel((errorChannel, channel) => {
        if (errorChannel) {
          const error = new Error(errorChannel.message || 'There was an error with sender createChannel method.');
          error.statusCode = errorChannel || 500;
          throw error;
        }

        const queue = STOCK_QUEUE;
        channel.assertQueue(queue, { durable: false });

        channel.consume(queue, msg => {
            connection.close();
            res.status(200).json({ botResponse: msg.content.toString() });
          },
          { noAck: true }
        );

      });
    });

  })
  .catch(error => {
    error.statusCode = error.statusCode || 500;
    next(error);
  });
};
