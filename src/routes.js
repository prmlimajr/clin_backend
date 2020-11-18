const express = require('express');
const rfr = require('rfr');

const routes = express.Router();

const UserController = rfr('src/app/controllers/UserController');

routes.post('/users', UserController.create);

module.exports = routes;
