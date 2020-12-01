const express = require('express');
const apiRouter = express.Router();

//const menuRouter = require('./menus');
const employeeRouter = require('./employees');

//apiRouter.use('/menus', menuRouter);
apiRouter.use('/employees', employeeRouter);

module.exports = apiRouter;