const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
  const userId = req.body.userId;
  const password = req.body.password;
  bcrypt
    .hash(password, 12)
    .then(hashedPw => {
      const user = new User({
        userId,
        password: hashedPw,
      });
      return user.save();
    })
    .then(result => {
      res.status(201).json({ message: 'User successfully created', userId: result._id });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.login = (req, res, next) => {
  const userId = req.body.userId;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ userId })
    .then(user => {
      if (!user) {
        const error = new Error('A user with this UserID could not be found.');
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Wrong password.');
        error.statusCode = 401;
        throw error;
      }
      const token = jwt.sign(
        {
          userId: loadedUser.userId
        },
        'secret-jwt-chat-app-27',
        { expiresIn: '1h' }
      );
      res.status(200).json({ token, userId });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
