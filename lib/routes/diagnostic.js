/* istanbul ignore file */
const os = require('os');

function getHealthcheck(req, res) {
  res.statusCode = 200;
  res.json({ status: 'pageok', host: os.hostname() });
}

function register(app) {
  app.get('/healthcheck.html', getHealthcheck);
}

module.exports = {
  register,
  getHealthcheck
};
