const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  client: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timeStamp: {
    type: Date,
    default: new Date()
  }
});

module.exports = mongoose.model('Message', messageSchema);
