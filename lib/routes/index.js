const diagnostic = require('./diagnostic');
const test = require('./test');
const project = require('./project');

function register(app) {
  diagnostic.register(app);
  test.register(app);
  project.register(app);
}

module.exports = {
  register
};
