import testApi from '../../lib/routes/test';
import assert from 'assert';
import { isValidTestRecord } from '../../lib/routes/test';

describe('Test Service', () => {
  let testUuid;
  let testName;
  let testBucketRegression;
  let testBucketTut;
  let testProject;
  let req;
  let res;

  before(async () => {
    testUuid = 'test-00001';
    testName = 'test name';
    testBucketRegression = '[dt_chrome_regression]';
    testBucketTut = '[dt_chrome_regression_tut]';
    testProject = 'test-projectz';
  });

  beforeEach(() => {
    req = {};
    res = {
      statusCode: '',
      json(json) {
        this.json = json;
      }
    };
  });

  it('[get_all] get all tests should return an array', done => {
    req.params = { project: testProject };
    testApi.getAll(req, res, () => {
      assert.equal(res.statusCode, 200);
      assert.deepEqual(res.json.tests, []);
      done();
    });
  });

  it('[create_record] create new record in service', done => {
    req.params = { project: testProject };
    req.body = { uuid: testUuid, name: testName, bucket: testBucketRegression };
    testApi.createOne(req, res, () => {
      assert.equal(res.statusCode, 201);
      done();
    });
  });

  it('[update_record] update record in service', done => {
    req.params = { project: testProject };
    req.body = { uuid: testUuid, name: testName, bucket: testBucketRegression };
    testApi.createOne(req, res, () => {
      assert.equal(res.statusCode, 201);
      res.json = function (json) {
        this.json = json;
      };
      req.params = { uuid: testUuid, project: testProject };
      req.body = { name: testName, bucket: testBucketTut };
      testApi.updateOne(req, res, () => {
        assert.equal(res.statusCode, 200);
        done();
      });
    });
  });

  it('[validate_record] validate meta_info record in service', done => {
    req.params = { project: testProject };
    req.body = { uuid: testUuid, name: testName, bucket: testBucketRegression };
    testApi.createOne(req, res, () => {
      assert.equal(res.statusCode, 201);
      res.json = function (json) {
        this.json = json;
      };
      req.params = { uuid: testUuid, project: testProject };
      req.body = { name: testName, bucket: testBucketTut };
      testApi.updateOne(req, res, () => {
        const firstKey = Object.keys(res.json.test.metaInfo)[0];
        assert.notEqual(res.json.test.metaInfo[firstKey].bucketUpdatedAt, null);
        assert.notEqual(res.json.test.metaInfo[firstKey].lastKnownBucket, null);
        done();
      });
    });
  });

  it('[delete_record] delete record in service', done => {
    req.params = { project: testProject };
    req.body = { uuid: testUuid, name: testName, bucket: testBucketRegression };
    testApi.createOne(req, res, () => {
      assert.equal(res.statusCode, 201);
      res.json = function (json) {
        this.json = json;
      };
      req.params = { uuid: testUuid, project: testProject };
      testApi.deleteOne(req, res, () => {
        assert.equal(res.statusCode, 200);
        done();
      });
    });
  });

  it("[invalid_record] don't create invalid record in service with uuid containing ',' ", done => {
    req.params = { project: testProject };
    req.body = { uuid: `${testUuid},`, name: testName, bucket: testBucketRegression };
    testApi.createOne(req, res, () => {
      assert.notEqual(res.statusCode, 201);
      done();
    });
  });

  it("[invalid_record] don't create invalid record in service with uuid containing '|' ", done => {
    req.params = { project: testProject };
    req.body = { uuid: `${testUuid}|`, name: testName, bucket: testBucketRegression };
    testApi.createOne(req, res, () => {
      assert.notEqual(res.statusCode, 201);
      done();
    });
  });

  it('[search_record] create and search record ', done => {
    req.body = { uuid: testUuid, name: testName, bucket: testBucketRegression };
    req.query = { q: testBucketRegression };
    req.params = { field: 'bucket', project: testProject };
    testApi.createOne(req, res, () => {
      assert.equal(res.statusCode, 201);
      res.json = function (json) {
        this.json = json;
      };
      testApi.searchField(req, res, () => {
        assert.ok(res.json.tests.length > 0);
        done();
      });
    });
  });

  it('[search_invalid_record] create and search on invalid field', done => {
    req.body = { uuid: testUuid, name: testName, bucket: testBucketRegression };
    req.query = { q: `${testBucketRegression}invalid-query` };
    req.params = { field: 'bucket', project: testProject };
    testApi.createOne(req, res, () => {
      assert.equal(res.statusCode, 201);
      res.json = function (json) {
        this.json = json;
      };
      testApi.searchField(req, res, () => {
        assert.ok(res.json.tests.length === 0);
        done();
      });
    });
  });

  it('[isValidTestRecord] isValid should be false if test is null', done => {
    isValidTestRecord(null, ({ isValid }) => {
      assert.equal(isValid, false);
      done();
    });
  });

  it('[isValidTestRecord] isValid should be true if test is valid', done => {
    const test = {
      bucket: testBucketTut,
      uuid: testUuid,
      project: testProject
    };

    isValidTestRecord(test, ({ isValid }) => {
      assert.equal(isValid, true);
      done();
    });
  });

  it('[isValidTestRecord] isValid should be false if uuid includes ,', done => {
    const test = {
      name: testName,
      bucket: testBucketTut,
      uuid: testUuid,
      project: testProject
    };

    isValidTestRecord(test, ({ isValid }) => {
      assert.equal(isValid, true);
      done();
    });
  });

  it('[isValidTestRecord] isValid should be false if uuid includes ,', done => {
    const test = {
      name: testName,
      bucket: testBucketTut,
      uuid: testUuid + ',',
      project: testProject
    };

    isValidTestRecord(test, ({ isValid }) => {
      assert.equal(isValid, false);
      done();
    });
  });

  it('[isValidTestRecord] isValid should be false if uuid includes |', done => {
    const test = {
      name: testName,
      bucket: testBucketTut,
      uuid: '|' + testUuid,
      project: testProject
    };

    isValidTestRecord(test, ({ isValid }) => {
      assert.equal(isValid, false);
      done();
    });
  });

  it('[isValidTestRecord] isValid should be false if test missing uuid', done => {
    const test = {
      name: testName,
      bucket: testBucketTut,
      project: testProject
    };

    isValidTestRecord(test, ({ isValid }) => {
      assert.equal(isValid, false);
      done();
    });
  });

  it('[isValidTestRecord] isValid should be false if test missing project', done => {
    const test = {
      name: testName,
      bucket: testBucketTut,
      uuid: testUuid
    };

    isValidTestRecord(test, ({ isValid }) => {
      assert.equal(isValid, false);
      done();
    });
  });

  it('[isValidTestRecord] isValid should be false if test missing bucket', done => {
    const test = {
      name: testName,
      uuid: testUuid,
      project: testProject
    };

    isValidTestRecord(test, ({ isValid }) => {
      assert.equal(isValid, false);
      done();
    });
  });

  it('[isValidTestRecord] isValid should be false if test has incorrect appArea', done => {
    const test = {
      bucket: testBucketTut,
      uuid: testUuid,
      project: testProject,
      appArea: 'appWhat'
    };

    isValidTestRecord(test, ({ isValid }) => {
      assert.equal(isValid, false);
      done();
    });
  });
});
