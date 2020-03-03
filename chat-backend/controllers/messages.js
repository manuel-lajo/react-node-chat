const io = require('../socket');

const timeStamp = `${new Date().toDateString()} - ${new Date().toTimeString()}`;
const messages = [
  { client: 'Max', content: 'I am fine, thanks John!', timeStamp },
  { client: 'John', content: 'Max, how are you doing?', timeStamp },
  { client: 'Max', content: 'hi John!', timeStamp },
];

exports.getMessages = (req, res) => {
  res.json(messages);
};

exports.postMessage = (req, res) => {
  const newMessage = req.body;
  newMessage.timeStamp = `${new Date().toDateString()} - ${new Date().toTimeString()}`;
  messages.unshift(newMessage);

  io.getIO().emit('messages', { action: 'new', newMessage });
  res.status(200).json({ message: 'message stored successfully' });
};
