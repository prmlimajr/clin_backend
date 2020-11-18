const express = require('express');
const rfr = require('rfr');

const routes = express.Router();

const UserController = rfr('src/app/controllers/UserController');

routes.post('/users', UserController.create);
routes.get('/users', UserController.list);
routes.get('/users/lazy', UserController.lazyList);
routes.get('/users/:id', UserController.listOne);

module.exports = routes;
