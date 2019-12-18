/* istanbul ignore file */
const swaggerJSDoc = require('swagger-jsdoc');
const packageJson = require('../../package.json');

function getSwaggerSpec(req) {
  // swagger definition
  const swaggerDefinition = {
    info: {
      title: 'Buckets Service',
      version: packageJson.version,
      description: 'Welcome to Bucket Service.'
    },
    host: getRootUrl(req),
    basePath: '/'
  };

  // options for the swagger docs
  const options = {
    swaggerDefinition, // import swaggerDefinitions
    apis: [
      './lib/routes/*.js'
    ] // path to the API docs
  };

  // initialize swagger-jsdoc
  return swaggerJSDoc(options);
}

function getRootUrl(req) {
  if (!req) return 'Not Available';
  return req.headers.host;
}

module.exports = getSwaggerSpec;
