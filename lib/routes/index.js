import diagnostic from './diagnostic';
import test from './test';
import project from './project';

function register(app) {
  diagnostic.register(app);
  test.register(app);
  project.register(app);
}

export default {
  register
};
