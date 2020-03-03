const Message = require('../models/message');
const io = require('../socket');

exports.getMessages = (req, res) => {
  Message.find()
  .limit(500)
  .sort('-timeStamp')
  .then(messages => {
    messages.sort((a, b) => b.timeStamp - a.timeStamp);
    res.json(messages)
  })
  .catch(err => {
    console.log(err);
  });
};

exports.postMessage = (req, res) => {
  const newMessage = new Message(req.body);
  newMessage
    .save()
    .then(newMessage => {
      io.getIO().emit('messages', { action: 'new', newMessage });
      res.status(200).json({ message: 'message stored successfully' });
    })
    .catch(err => {
      console.log(err);
    });
};
