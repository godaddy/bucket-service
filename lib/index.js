import mongoose from 'mongoose';
import app from './app';
import sanitize from 'mongo-sanitize';
let server;

function start(opts) {
  const host = process.env.BUCKET_MONGOHOST || opts.host || 'localhost'; // eslint-disable-line no-process-env
  const db = process.env.BUCKET_MONGODB || opts.database || 'test'; // eslint-disable-line no-process-env
  const port = process.env.NODE_PORT || opts.port || 8080; // eslint-disable-line no-process-env
  const mongoDbUrl = `mongodb://${sanitize(host)}/${sanitize(db)}`;
  mongoose.connect(mongoDbUrl, { useNewUrlParser: true });
  server = app.listen(port);
}

function stop() {
  if (server) server.close();
}

export default {
  start,
  stop
};

start({});
