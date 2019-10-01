'use strict';

//mongoose file must be loaded before all other files in order to provide
// models to other modules
var express = require('express'),
  router = express.Router(),
  bodyParser = require('body-parser'),
  swaggerUi = require('swagger-ui-express'),
  swaggerDocument = require('./swagger.json');

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

mongoose.connect('mongodb://user:password1@ds133094.mlab.com:33094/assesment-node-api');

var UserSchema = new Schema({
  email: {
    type: String, required: true,
    trim: true, unique: true,
    match: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/
  },
  firstName: {type: String},
  lastName: {type: String},
  password: {type: String}
});

mongoose.model('User', UserSchema);

var User = require('mongoose').model('User');

var app = express();

//rest API requirements
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

//middleware for create
var createUser = function (req, res, next) {
  var user = new User(req.body);

  user.save(function (err) {
    if (err) {
      next(err);
    } else {
      res.json(user);
    }
  });
};

var getByEmail = function (req, res, next) {
  User.findOne({'email': req.body.email, 'password': req.body.password}, function (err, user) {
    console.log(req.body)
    if (err) {
      next(err);
    } else {
      res.json(user)
    }
  });
};

var deleteUser = function (req, res, next) {
  req.user.remove(function (err) {
    if (err) {
      next(err);
    } else {
      res.json(req.user);
    }
  });
};

var getAllUsers = function (req, res, next) {
  User.find(function (err, users) {
    if (err) {
      next(err);
    } else {
      res.json(users);
    }
  });
};

var getOneUser = function (req, res) {
  res.json(req.user);
};

var getByIdUser = function (req, res, next, firstName) {
  User.findOne({firstName: firstName}, function (err, user) {
    if (err) {
      next(err);
    } else {
      req.user = user;
      next();
    }
  });
};

router.route('/users')
  .post(getByEmail)
  .get(getAllUsers);

router.route('/users/:userId')
  .get(getOneUser)
  .delete(deleteUser);

router.param('userId', getByIdUser);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api/v1', router);

const PORT = process.env.PORT || 9090;
app.listen(PORT);
module.exports = app;
