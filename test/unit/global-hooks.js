const app = require('../../lib');
const mongoose = require('mongoose');
const Mockgoose = require('mockgoose').Mockgoose;

const mockgoose = new Mockgoose(mongoose);

before(async () => {
  await mockgoose.prepareStorage();
  await mongoose.connect(
    'mongodb://foox/bar',
    {
      useNewUrlParser: true,
      reconnectTries: Number.MAX_VALUE,
      useUnifiedTopology: true
    }
  );
  mongoose.connection.on('connected', () => {
    console.log('db connection is now open'); // eslint-disable-line no-console
  });
  app.start({ port: 3333 });
});

after(() => {
  app.stop();
});

afterEach(() => {
  mockgoose.helper.reset();
});
