import app from '../../lib';
import mongoose from 'mongoose';
import { Mockgoose } from 'mockgoose';

const mockgoose = new Mockgoose(mongoose);

before(async () => {
  await mockgoose.prepareStorage();
  mongoose.connect('mongodb://foox/bar', { useNewUrlParser: true });
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
