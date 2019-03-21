/* istanbul ignore file */
import os from 'os';

function getHealthcheck(req, res) {
  res.statusCode = 200;
  res.json({ status: 'pageok', host: os.hostname() });
}

function register(app) {
  app.get('/healthcheck.html', getHealthcheck);
}

export default {
  register,
  getHealthcheck
};
