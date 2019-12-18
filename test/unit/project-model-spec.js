const testApi = require('../../lib/routes/project');
const assert = require('assert');
const isValidProjectRecord = require('../../lib/routes/project').isValidProjectRecord;

describe('Project Model', () => {
  let testProject;
  let testProjectDescription;
  let req;
  let res;

  before(async () => {
    testProject = 'test-project';
    testProjectDescription = 'Test Project Description';
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

  it('[create_record] create new record in service', done => {
    req.body = { name: testProject, description: testProjectDescription };
    testApi.createOne(req, res, () => {
      assert.equal(res.statusCode, 201);
      assert.equal(res.json.project.name, testProject);
      assert.equal(res.json.project.description, testProjectDescription);
      res.json = function (json) {
        this.json = json;
      };
      req.params = { name: testProject };
      testApi.getOne(req, res, () => {
        assert.equal(res.statusCode, 200);
        assert.equal(res.json.project.name, testProject);
        assert.equal(res.json.project.description, testProjectDescription);
        done();
      });
    });
  });

  it('[update_record] update record in service', done => {
    const newProject = 'Barracuda';
    const newDescription = 'New Description';
    req.body = { name: testProject, description: testProjectDescription };
    testApi.createOne(req, res, () => {
      assert.equal(res.statusCode, 201);
      res.json = function (json) {
        this.json = json;
      };
      req.params = { name: testProject };
      req.body = { name: newProject, description: newDescription };
      testApi.updateOne(req, res, () => {
        assert.equal(res.statusCode, 200);
        res.json = function (json) {
          this.json = json;
        };
        req.params = { name: newProject };
        testApi.getOne(req, res, () => {
          assert.equal(res.statusCode, 200);
          assert.equal(res.json.project.name, newProject);
          assert.equal(res.json.project.description, 'New Description');
          done();
        });
      });
    });
  });

  it('[delete_record] delete record in service', done => {
    req.body = { name: testProject, description: testProjectDescription };
    testApi.createOne(req, res, () => {
      assert.equal(res.statusCode, 201);
      res.json = function (json) {
        this.json = json;
      };
      req.params = { name: testProject };
      testApi.deleteOne(req, res, () => {
        assert.equal(res.statusCode, 200);
        res.json = function (json) {
          this.json = json;
        };
        testApi.getAll(req, res, () => {
          assert.equal(res.json.projects.length, 0);
          done();
        });
      });
    });
  });

  it('[invalid_record] don\'t create duplicate records in service', done => {
    req.body = { name: testProject, description: testProjectDescription };
    testApi.createOne(req, res, () => {
      assert.equal(res.statusCode, 201);
      res.json = function (json) {
        this.json = json;
      };
      testApi.createOne(req, res, () => {
        assert.notEqual(res.statusCode, 201);
        done();
      });
    });
  });

  it('[search_record] create and search record ', done => {
    req.body = { name: testProject, description: testProjectDescription };
    testApi.createOne(req, res, () => {
      assert.equal(res.statusCode, 201);
      res.json = function (json) {
        this.json = json;
      };
      req.query = { q: testProject };
      req.params = { field: 'name' };
      testApi.searchField(req, res, () => {
        assert.ok(res.json.projects.length > 0);
        done();
      });
    });
  });

  it('[isValidTestRecord] isValid should be false if project is null', done => {
    const isValid = isValidProjectRecord(null);
    assert.equal(isValid, false);
    done();
  });

  it('[isValidTestRecord] isValid should be true if project is valid', done => {
    const project = {
      name: testProject
    };

    const isValid = isValidProjectRecord(project);
    assert.equal(isValid, true);
    done();
  });

  it('[isValidTestRecord] isValid should be false if project missing name', done => {
    const project = {
      description: testProjectDescription
    };

    const isValid = isValidProjectRecord(project);
    assert.equal(isValid, false);
    done();
  });
});
