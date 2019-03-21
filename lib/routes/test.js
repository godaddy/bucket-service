/* eslint-disable valid-jsdoc */
import TestModel from '../models/test';
import ProjectModel from '../models/project';
import escapeStringRegexp from 'escape-string-regexp';
import { getDifference } from '../utils';
import { getObjForTag } from '../utils';
import { extractTags } from '../utils';
import { filterTags } from '../utils';
import mongoose from 'mongoose';
import sanitize from 'mongo-sanitize';

/**
 * @swagger
 * /projects/{project}/tests/{uuid}:
 *   get:
 *     tags:
 *       - Buckets
 *     description: Get current bucket for a test by uuid.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: project
 *         description: Project where the test lives
 *         in: path
 *         required: true
 *         type: string
 *         example: "Barracuda"
 *       - name: uuid
 *         description: UUID of the test
 *         in: path
 *         required: true
 *         type: string
 *         example: "test-00001"
 *     responses:
 *       200:
 *        description: All OK! Route execution was successful and response was returned.
 *       404:
 *        description: Resource not found.
 *       500:
 *        description: Internal server error occurred. Please create an issue on github repo.
 */
function getOne({ params }, res, callback) {
  const uuid = sanitize(params.uuid);
  const project = sanitize(params.project);
  TestModel.find({ uuid: uuid, project: project }, (err, tests) => {
    if (err) {
      res.statusCode = 500;
      res.json({
        error: err
      });
    } else if (tests.length !== 0) {
      res.statusCode = 200;
      res.json({ test: tests[0] });
    } else {
      res.statusCode = 404;
      res.json({
        error: 'Resource not found.'
      });
    }
    if (callback) return callback();
  });
}

/**
 * @swagger
 * /projects/{project}/tests:
 *   get:
 *     tags:
 *       - Buckets
 *     description: Get list of all tests in a bucket.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: project
 *         description: Project where the test lives
 *         in: path
 *         required: true
 *         type: string
 *         example: "Barracuda"
 *     responses:
 *       200:
 *        description: All OK! Route execution was successful and response was returned.
 *       500:
 *        description: Internal server error occurred. Please create an issue on github repo.
 */
function getAll({ params }, res, callback) {
  const project = sanitize(params.project);
  TestModel.find({ project: project }, (err, tests) => {
    if (err) {
      res.statusCode = 500;
      res.json({
        error: err
      });
    } else {
      res.statusCode = 200;
      res.json({ tests });
    }
    if (callback) return callback();
  });
}

/**
 * @swagger
 * /projects/{project}/tests:
 *   post:
 *     tags:
 *       - Buckets
 *     description: Create a new entry in the bucket service.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: project
 *         description: Project where the test lives
 *         in: path
 *         required: true
 *         type: string
 *         example: "Barracuda"
 *       - name: payload
 *         description: payload to update data in bucket service for a uuid
 *         in: body
 *         schema:
 *           type: object
 *           required:
 *             - uuid
 *           properties:
 *             bucket:
 *               type: string
 *             name:
 *               type: string
 *             uuid:
 *               type: string
 *             appArea:
 *               type: string
 *     responses:
 *       201:
 *        description: All OK! Resource was created successfully.
 *       409:
 *        description: Conflict. Resource with uuid already exists.
 *       500:
 *        description: Internal server error occurred. Please create an issue on github repo.
 */
function createOne({ body, params }, res, callback) {
  const name = sanitize(body.name);
  const bucket = sanitize(body.bucket);
  const uuid = sanitize(body.uuid);
  const appArea = sanitize(body.appArea);
  const project = sanitize(params.project);
  const test = {
    name,
    bucket,
    uuid,
    appArea,
    project
  };
  isValidTestRecord(test, ({ isValid, message }) => {
    if (isValid) {
      TestModel.find({ uuid: uuid, project: project }, (findErr, { length }) => {
        if (findErr) {
          res.statusCode = 500;
          res.json({
            error: findErr
          });
        }
        // check if this test already exist. Send 409: Conflict if it does
        if (length !== 0) {
          res.statusCode = 409;
          res.json({
            error: `Conflict: Resource with uuid '${body.uuid}' already exists.`
          });
          if (callback) return callback();
        } else {
          const newTest = new TestModel(test);
          const currentDate = new Date();
          const allTags = extractTags(newTest.bucket);
          const newTags = filterTags(allTags, '_new]');

          newTags.forEach(newTag => {
            const key = mongoose.Types.ObjectId(); // eslint-disable-line new-cap
            const metaObj = {};
            metaObj.lastKnownBucket = '';
            metaObj.currentBucket = newTag;
            metaObj.bucketUpdatedAt = currentDate;
            newTest.metaInfo[key] = metaObj;
          });
          // Everything is perfect. Save!
          newTest.save((saveErr, t) => {
            if (saveErr) {
              res.statusCode = 500;
              res.json({
                error: saveErr
              });
            } else {
              res.statusCode = 201;
              res.json({ test: t });
            }
            if (callback) return callback();
          });
        }
      });
    } else {
      // not a valid record
      res.statusCode = 400;
      res.json({
        error: message
      });
      if (callback) return callback();
    }
  });
}

/**
 * @swagger
 * /projects/{project}/tests/{uuid}:
 *   put:
 *     tags:
 *       - Buckets
 *     description: Update a UUID with new information (bucket, name).
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: project
 *         description: Project where the test lives
 *         in: path
 *         required: true
 *         type: string
 *         example: "Barracuda"
 *       - name: uuid
 *         description: UUID of the test
 *         in: path
 *         required: true
 *         type: string
 *         example: "test-00001"
 *       - name: payload
 *         description: payload to update data in bucket service for a uuid
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             bucket:
 *               type: string
 *             name:
 *               type: string
 *             appArea:
 *               type: string
 *     responses:
 *       200:
 *        description: All OK! Resource was updated.
 *       404:
 *        description: Resource with uuid not found.
 *       500:
 *        description: Internal server error occurred. Please create an issue on github repo.
 */
function updateOne({ params, body }, res, callback) {
  const uuid = sanitize(params.uuid);
  const project = sanitize(params.project);
  TestModel.find({ uuid: uuid, project: project }, (findErr, tests) => {
    if (findErr) {
      res.statusCode = 500;
      res.json({ error: findErr });
      if (callback) return callback();
    } else if (tests.length !== 0) {

      const test = tests[0];
      if (body.hasOwnProperty('name') && body.name) test.name = body.name;
      if (body.hasOwnProperty('project') && params.project) test.project = params.project;

      if (body.hasOwnProperty('bucket') && body.bucket) {
        const diff = getDifference(test.bucket, body.bucket);
        const currentDate = new Date();

        for (let i = 0; i < diff.oldTags.length; i++) {
          const keyMetaObj = getObjForTag(test.metaInfo, diff.oldTags[i]);
          let metaObj;
          let key;

          if (keyMetaObj) {
            key = keyMetaObj.key;
            metaObj = keyMetaObj.metaObj;
          } else {
            key = mongoose.Types.ObjectId(); // eslint-disable-line new-cap
            metaObj = {};
          }
          metaObj.lastKnownBucket = diff.oldTags[i];
          metaObj.currentBucket = diff.newTags[i];
          metaObj.bucketUpdatedAt = currentDate;
          test.metaInfo[key] = metaObj;
        }

        // Deleting old schema keys. Need to remove when all old keys have been deleted
        delete test.metaInfo.lastKnownBucket;
        delete test.metaInfo.bucketUpdatedAt;

        test.markModified('metaInfo');
        test.bucket = body.bucket;
      }

      if (body.hasOwnProperty('appArea') && body.appArea) {
        containsValidAppArea({ project: test.project, appArea: body.appArea }, (appAreaErr, validAppArea) => {
          if (appAreaErr) {
            res.statusCode = 500;
            res.json({ error: appAreaErr });
          } else if (validAppArea) {
            test.appArea = body.appArea;
            test.save((saveErr, t) => {
              if (saveErr) {
                res.statusCode = 500;
                res.json({ error: saveErr });
              } else {
                res.statusCode = 200;
                res.json(t);
                if (callback) return callback();
              }
            });
          } else {
            res.statusCode = 404;
            res.json({ error: 'Apparea is not valid for this project' });
            if (callback) return callback();
          }
        });
      } else {
        test.save((saveErr, t) => {
          if (saveErr) {
            res.statusCode = 500;
            res.json({ error: saveErr });
          } else {
            res.statusCode = 200;
            res.json({ test: t });
            if (callback) return callback();
          }
        });
      }

    } else {
      res.statusCode = 404;
      res.json({ error: `Resource with uuid: ${params.uuid} not found.` });
      if (callback) return callback();
    }
  });
}

/**
 * @swagger
 * /projects/{project}/tests/{uuid}:
 *   delete:
 *     tags:
 *       - Buckets
 *     description: Delete a UUID from the bucket service.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: project
 *         description: Project where the test lives
 *         in: path
 *         required: true
 *         type: string
 *         example: "Barracuda"
 *       - name: uuid
 *         description: UUID of the test
 *         in: path
 *         required: true
 *         type: string
 *         example: "test-00001"
 *     responses:
 *       200:
 *        description: All OK! Test successfully deleted.
 *       404:
 *        description: Resource with uuid not found.
 *       500:
 *        description: Internal server error occurred. Please create an issue on github repo.
 */
function deleteOne({ params }, res, callback) {
  const uuid = sanitize(params.uuid);
  const project = sanitize(params.project);
  TestModel.find({ uuid: uuid, project: project }, (findErr, tests) => {
    if (findErr) {
      res.statusCode = 500;
      res.json({
        error: findErr
      });
      if (callback) return callback();
    } else if (tests.length !== 0) {
      const test = tests[0];
      test.remove(removeErr => {
        if (removeErr) {
          res.statusCode = 500;
          res.json({
            error: removeErr
          });
        } else {
          res.statusCode = 200;
          res.json({
            message: 'Test successfully deleted.'
          });
        }
        if (callback) return callback();
      });
    } else {
      res.statusCode = 404;
      res.json({
        error: `Resource with uuid: ${params.uuid} not found.`
      });
      if (callback) return callback();
    }
  });
}

/**
 * @swagger
 * /projects/{project}/tests/search/{field}:
 *   get:
 *     tags:
 *       - Buckets
 *     description: Get tests/uuids in a bucket.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: project
 *         description: Project where the test lives
 *         in: path
 *         required: true
 *         type: string
 *         example: "Barracuda"
 *       - name: field
 *         description: Field you want to get results from
 *         in: path
 *         required: true
 *         type: string
 *         example: bucket
 *       - name: q
 *         description: Search query
 *         in: query
 *         required: true
 *         type: string
 *         example: "dt_chrome_regression"
 *     responses:
 *       200:
 *        description: All OK! Results were returned.
 *       500:
 *        description: Internal server error occurred. Please create an issue on github repo.
 */
function searchField(req, res, callback) {
  const project = sanitize(req.params.project);
  const field = sanitize(req.params.field);
  let q = req.query.q || '';
  q = escapeStringRegexp(q);
  const search = new RegExp(q, 'i');
  const query = {
    project,
    [field]: { $regex: search }
  };
  TestModel.find(query, (err, tests) => {
    if (err) {
      res.statusCode = 500;
      res.json({
        error: err
      });
    } else {
      res.statusCode = 200;
      res.json({ tests });
    }
    if (callback) return callback();
  });
}

function getRequiredKeys() {
  return ['bucket', 'uuid', 'project'];
}

function getDisallowedCharacters() {
  return [',', '|'];
}

function containsValidAppArea({ project, appArea }, cb) {
  if (!project) return cb('projectName not provided', null);
  ProjectModel.findOne({ name: project }, (err, projectFound) => {
    if (projectFound === null) return cb(`Project ${project} not found`, null);
    if (projectFound.appAreas === null) return cb(`No appAreas found for project ${project}`, null);
    return cb(err, projectFound.appAreas.includes(appArea));
  });
}

function isValidTestRecord(test, cb) {
  if (!test) return cb({ isValid: false, message: 'Test object is null' });

  const hasRequiredKeys = getRequiredKeys().every(key => test[key]);
  if (!hasRequiredKeys) return cb({ isValid: false, message: `Record is invalid. Expecting ${getRequiredKeys().toString()}` });

  const hasDisallowedCharacters = getDisallowedCharacters().some(char => test.uuid.includes(char));
  if (hasDisallowedCharacters) return cb({ isValid: false, message: `UUID does not allow: '${getDisallowedCharacters().join("' or '")}'` });

  if (test.appArea) {
    containsValidAppArea(test, (err, validAppArea) => {
      if (err) return cb({ isValid: false, message: err });
      if (validAppArea) {
        return cb({ isValid: true });
      }
      return cb({ isValid: false, message: 'AppArea is not valid for this project.' });
    });
  } else {
    return cb({ isValid: true });
  }

}

function register(app) {
  app.get('/projects/:project/tests/', getAll);
  app.get('/projects/:project/tests/search/:field', searchField);
  app.get('/projects/:project/tests/:uuid', getOne);
  app.post('/projects/:project/tests/', createOne);
  app.put('/projects/:project/tests/:uuid', updateOne);
  app.delete('/projects/:project/tests/:uuid', deleteOne);
}

export default {
  register,
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
  searchField,
  isValidTestRecord
};
