
const timeStamp = `${new Date().toDateString()} - ${new Date().toTimeString()}`;
const messages = [
  { client: 'Max', content: 'I am fine, thanks John!', timeStamp },
  { client: 'John', content: 'Max, how are you doing?', timeStamp },
  { client: 'Max', content: 'hi John!', timeStamp },
];

exports.getMessages = (req, res) => {
  res.json(messages);
};
