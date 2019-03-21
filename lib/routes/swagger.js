/* istanbul ignore file */
import { Router } from 'express';
import getSwaggerSpec from '../services/swagger';
import swaggerUi from 'swagger-ui-express';

const routes = new Router();

routes.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(getSwaggerSpec(req));
});

routes.use('/', swaggerUi.serve, (req, res, next) => {
  const swaggerUiHandler = swaggerUi.setup(getSwaggerSpec(req));
  swaggerUiHandler(req, res, next);
});

export default routes;
