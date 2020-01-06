const mongoose = require('mongoose');
const app = require('./app');
const sanitize = require('mongo-sanitize');
let server;

function start(opts) {
  const host = process.env.BUCKET_MONGOHOST || opts.host || 'localhost'; // eslint-disable-line no-process-env
  const db = process.env.BUCKET_MONGODB || opts.database || 'test'; // eslint-disable-line no-process-env
  const port = process.env.NODE_PORT || opts.port || 8080; // eslint-disable-line no-process-env
  const mongoDbUrl = `mongodb://${sanitize(host)}/${sanitize(db)}`;
  mongoose.connect(
    mongoDbUrl,
    {
      useNewUrlParser: true,
      reconnectTries: Number.MAX_VALUE,
      useUnifiedTopology: true
    }
  );
  mongoose.connection.on('connected', function () {
    console.log('Mongoose default connection is open to ', mongoDbUrl);
  });
  mongoose.connection.on('error', function (err) {
    console.log('Mongoose default connection error has occured: ' + err);
  });
  mongoose.connection.on('disconnected', function () {
    console.log('Mongoose default connection disconnected');
    console.log('Trying to reconnect');

    function connect() {
      mongoose.connect(mongoDbUrl, { useNewUrlParser: true }, function (err) {
        if (err) console.log('Error while trying to reconnect to MongoDB');
      });
    }
    setTimeout(connect, 3000);
  });
  server = app.listen(port);
}

function stop() {
  if (server) server.close();
}

module.exports = {
  start,
  stop
};

if (!module.parent) {
  start({});
}
