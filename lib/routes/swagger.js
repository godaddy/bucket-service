/* istanbul ignore file */
const Router = require('express').Router;
const getSwaggerSpec = require('../services/swagger');
const swaggerUi = require('swagger-ui-express');

const routes = new Router();

routes.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(getSwaggerSpec(req));
});

routes.use('/', swaggerUi.serve, (req, res, next) => {
  const swaggerUiHandler = swaggerUi.setup(getSwaggerSpec(req));
  swaggerUiHandler(req, res, next);
});

module.exports = routes;
