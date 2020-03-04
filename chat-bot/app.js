const express = require("express");
const amqp = require("amqplib/callback_api");

const app = express();

// review headers and method access
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  next();
});

app.get("/stock", (req, res, next) => {
  // receiver
  amqp.connect("amqp://localhost", function(errorConnection, connection) {
    if (errorConnection) {
      throw errorConnection;
    }

    connection.createChannel(function(errorChannel, channel) {
      if (errorChannel) {
        throw errorChannel;
      }

      var queue = "hello";
      var msg = "Hello World!";
      channel.assertQueue(queue, { durable: false });

      channel.sendToQueue(queue, Buffer.from(msg));
      // console.log(" [x] Sent %s", msg);
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

      var queue = "hello";
      channel.assertQueue(queue, { durable: false });

      // console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
      channel.consume(queue, function(msg) {
          // console.log(" [x] Received %s", msg.content.toString());
          connection.close();
          res.status(200).json({ message: "I am the bot, stock is: " + msg.content.toString() });
        },
        {
          noAck: true
        }
      );

    });
  });

});


app.listen(8000);
