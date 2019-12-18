const cors = require('cors');
const express = require('express');
const routes = require('./routes');
const bodyParser = require('body-parser');
const app = express();
const SwaggerRoutes = require('./routes/swagger');

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

module.exports = {
  listen
};
