const Message = require('../models/message');
const io = require('../socket');

exports.getMessages = (req, res) => {
  Message.find()
  .limit(50)
  .sort('-timeStamp')
  .then(messages => {
    messages.sort((a, b) => b.timeStamp - a.timeStamp);
    res.json(messages)
  })
  .catch(error => {
    error.statusCode = error.statusCode || 500;
    next(error);
  });
};

exports.postMessage = (req, res) => {
  const newMessage = new Message(req.body);
  newMessage
    .save()
    .then(newMessage => {
      io.getIO().emit('messages', { action: 'new', newMessage });
      res.status(200).json({ message: 'Message stored successfully.' });
    })
    .catch(error => {
      error.statusCode = error.statusCode || 500;
      next(error);
    });
};
