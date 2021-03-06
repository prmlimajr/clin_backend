const express = require('express');
const rfr = require('rfr');

const routes = express.Router();

const UserController = rfr('src/app/controllers/UserController');
const AdminController = rfr('src/app/controllers/AdminController');
const SessionCrontroller = rfr('src/app/controllers/SessionCrontroller');
const PatientController = rfr('src/app/controllers/PatientController');
const HealthCondition = rfr('src/app/controllers/HealthCondition');
const DashboardController = require('./app/controllers/DashboardController');

const authConfig = rfr('src/app/middlewares/auth');

routes.post('/users', UserController.create);
routes.post('/session', SessionCrontroller.create);

routes.use(authConfig);

routes.get('/users', UserController.list);
routes.get('/users/lazy', UserController.lazyList);
routes.get('/users/:id', UserController.listOne);
routes.put('/users/:id', UserController.update);
routes.delete('/users/:id', UserController.delete);
routes.put('/users/:id/admin', AdminController.update);
routes.post('/patient', PatientController.create);
routes.get('/patient', PatientController.list);
routes.get('/patient/lazy', PatientController.lazyList);
routes.get('/patient/:id', PatientController.listOne);
routes.put('/patient/:id', PatientController.update);
routes.delete('/patient/:id', PatientController.delete);
routes.post('/health-condition', HealthCondition.create);
routes.put('/health-condition/:id', HealthCondition.update);
routes.delete('/health-condition/:id', HealthCondition.delete);
routes.get('/dashboard/lazy', DashboardController.lazyList);

module.exports = routes;
