const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  userId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  chatRoom: {
    type: Number,
    required: true
  },
  timeStamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Message', messageSchema);
