const axios = require('axios');
const ProjectModel = require('../../lib/models/project');
const mongoose = require('mongoose');
const assert = require('assert');
const ObjectID = require('mongodb').ObjectID;

describe('Project Model', () => {
  let testProject;
  let testProjectDescription;
  let rootUrl;

  before(async () => {
    testProject = 'test-project';
    testProjectDescription = 'My test project';

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

    rootUrl = `http://localhost:8080/projects`;
  });

  after(async () => {
    await mongoose.connection.close();
  });

  afterEach(async () => {
    await ProjectModel.deleteOne({ name: testProject });
  });

  it('[create_record] create new record in prod/test service', async () => {
    const res = await axios
      .post(rootUrl, {
        name: testProject, description: testProjectDescription
      });
    assert.equal(typeof res.data.project._id, 'string');
    assert.equal(res.data.project.name, testProject);
    assert.equal(res.data.project.description, testProjectDescription);
    assert.equal(res.status, 201);

    const project = await ProjectModel.find({ name: testProject });
    assert.equal(project.length, 1);
  });

  it('[create_record_invalid] attempt to create a project without a name', async () => {
    try {
      await axios
        .post(rootUrl, {
          description: testProjectDescription
        });
      assert.fail('Missing the name should throw an error.');
    } catch (e) {
      assert.equal(e.response.status, 400);
    }
  });

  it('[update_record] update record in prod/test service', async () => {
    await addProject();

    testProject = encodeURIComponent(testProject);
    const newProjectName = 'Barracuda';
    const newProjectDescription = 'New Description';
    const res = await axios
      .put(`${rootUrl}/${testProject}`, {
        name: newProjectName, description: newProjectDescription
      });

    assert.equal(typeof res.data.project._id, 'string');
    assert.equal(res.data.project.name, newProjectName);
    assert.equal(res.data.project.description, newProjectDescription);
    assert.equal(res.status, 200);
  });

  it('[search_record] search and find record in prod/test service', async () => {
    await addProject();
    const searchField = 'name';
    const searchValue = 't-pr';
    const res = await axios.get(`${rootUrl}/search/${searchField}?q=${searchValue}`);

    assert.equal(res.data.projects.length, 1);
    assert.equal(typeof res.data.projects[0]._id, 'string');
    assert.equal(res.data.projects[0].name, testProject);
    assert.equal(res.data.projects[0].description, testProjectDescription);
    assert.equal(res.status, 200);
  });

  it('[search_record] search and not find record in prod/test service', async () => {
    await addProject();
    const searchField = 'name';
    const searchValue = 't-pz';
    const res = await axios.get(`${rootUrl}/search/${searchField}?q=${searchValue}`);

    assert.equal(res.data.projects.length, 0);
  });

  it('[delete_record] delete record in prod/test service', async () => {
    await addProject();

    testProject = encodeURIComponent(testProject);
    const res = await axios
      .delete(`${rootUrl}/${testProject}`);

    assert.equal(res.data.message, 'Project successfully deleted.');
    assert.equal(res.status, 200);
    const projects = await ProjectModel.find({ name: testProject });
    assert.equal(projects.length, 0);
  });

  async function addProject() {
    const project = new ProjectModel({
      name: testProject,
      description: testProjectDescription,
      _id: new ObjectID()
    });

    await project.save();
  }
});
