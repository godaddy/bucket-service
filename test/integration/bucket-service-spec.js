const axios = require('axios');
const TestModel = require('../../lib/models/test');
const mongoose = require('mongoose');
const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;

describe('Test Service', () => {
  let testUuid;
  let testName;
  let testBucketRegression;
  let testBucketTut;
  let searchField;
  let testProject;
  let rootUrl;

  before(async () => {
    testUuid = 'test-00001';
    testName = 'test name';
    testBucketRegression = '[dt_chrome_regression]';
    testBucketTut = '[dt_chrome_regression_tut]';
    testProject = 'test-project';
    searchField = 'bucket';

    const host = process.env.BUCKET_MONGOHOST || 'localhost'; // eslint-disable-line no-process-env
    const db = process.env.BUCKET_MONGODB || 'test'; // eslint-disable-line no-process-env
    const mongoDbUrl = `mongodb://${host}/${db}`;
    await mongoose.connect(
      mongoDbUrl,
      {
        useNewUrlParser: true,
        reconnectTries: Number.MAX_VALUE,
        useUnifiedTopology: true
      }
    );

    rootUrl = `http://localhost:8080/projects/${testProject}/tests`;
  });

  after(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await TestModel.deleteOne({ uuid: testUuid, project: testProject });
  });

  it('[create_record] create new record in prod/test service', async () => {
    const res = await axios
      .post(rootUrl, {
        uuid: testUuid, name: testName, bucket: testBucketRegression
      });

    assert.equal(typeof res.data.test._id, 'string');
    assert.equal(res.data.test.name, testName);
    assert.equal(res.data.test.bucket, testBucketRegression);
    assert.equal(res.data.test.uuid, testUuid);
    assert.equal(res.data.test.project, testProject);
    assert.equal(res.status, 201);

    const test = await TestModel.find({ uuid: testUuid, project: testProject });
    assert.equal(test.length, 1);
  });

  it('[update_record] update record in prod/test service', async () => {
    await addTest();

    testUuid = encodeURIComponent(testUuid);
    const res = await axios
      .put(`${rootUrl}/${testUuid}`, {
        name: testName, bucket: testBucketTut
      });

    assert.equal(typeof res.data.test._id, 'string');
    assert.equal(res.data.test.name, testName);
    assert.equal(res.data.test.bucket, testBucketTut);
    assert.equal(res.data.test.uuid, testUuid);
    assert.equal(res.data.test.project, testProject);
    const firstKey = Object.keys(res.data.test.metaInfo)[0];
    assert.notEqual(res.data.test.metaInfo[firstKey].bucketUpdatedAt, null);
    assert.equal(res.data.test.metaInfo[firstKey].lastKnownBucket, testBucketRegression);
    assert.equal(res.data.test.metaInfo[firstKey].currentBucket, testBucketTut);
    assert.equal(res.status, 200);
  });

  it('[search_record] search record in prod/test service', async () => {
    await addTest();
    const res = await axios.get(`${rootUrl}/search/${searchField}?q=${testBucketRegression}`);

    assert.equal(typeof res.data.tests[0]._id, 'string');
    assert.equal(res.data.tests[0].name, testName);
    assert.equal(res.data.tests[0].bucket, testBucketRegression);
    assert.equal(res.data.tests[0].uuid, testUuid);
    assert.equal(res.data.tests[0].project, testProject);
    assert.equal(res.status, 200);
  });

  it('[delete_record] delete record in prod/test service', async () => {
    await addTest();

    testUuid = encodeURIComponent(testUuid);
    const res = await axios
      .delete(`${rootUrl}/${testUuid}`);

    assert.equal(res.data.message, 'Test successfully deleted.');
    assert.equal(res.status, 200);
    const tests = await TestModel.find({ uuid: testUuid, project: testProject });
    assert.equal(tests.length, 0);
  });

  async function addTest() {
    const test = new TestModel({
      name: testName,
      bucket: testBucketRegression,
      uuid: testUuid,
      project: testProject,
      _id: new ObjectID()
    });

    await test.save();
  }
});
