import cors from 'cors';
import express from 'express';
import routes from './routes';
import bodyParser from 'body-parser';
const app = express();
import SwaggerRoutes from './routes/swagger';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use('/docs', SwaggerRoutes);

routes.register(app);

function listen(requestedPort) {
  const server = app.listen(requestedPort, () => {
    const { address: host, port: actualPort } = server.address();
    console.log('Bucket Service listening at http://%s:%s', host, actualPort); // eslint-disable-line no-console
  });
  return server;
}

export default {
  listen
};
