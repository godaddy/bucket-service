/* eslint-disable valid-jsdoc */
const ProjectModel = require('../models/project');
const escapeStringRegexp = require('escape-string-regexp');
const _ = require('lodash');
const sanitize = require('mongo-sanitize');

/**
 * @swagger
 * /projects/{name}:
 *   get:
 *     tags:
 *       - Projects
 *     description: Get information about the project.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         description: Project about which you want to get information about
 *         in: path
 *         required: true
 *         type: string
 *         example: "Barracuda"
 *     responses:
 *       200:
 *        description: All OK! Route execution was successful and response was returned.
 *       404:
 *        description: Resource not found.
 *       500:
 *        description: Internal server error occurred. Please create an issue on github repo.
 */
function getOne({ params }, res, callback) {
  const name = sanitize(params.name);
  ProjectModel.find({ name: name }, (err, projects) => {
    if (err) {
      res.statusCode = 500;
      res.json({
        error: err
      });
    } else if (projects.length !== 0) {
      res.statusCode = 200;
      res.json({ project: projects[0] });
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
 * /projects:
 *   get:
 *     tags:
 *       - Projects
 *     description: Get list of all projects.
 *     produces:
 *       - application/json
 *     responses:
 *       200:
 *        description: All OK! Route execution was successful and response was returned.
 *       500:
 *        description: Internal server error occurred. Please create an issue on github repo.
 */
function getAll(req, res, callback) {
  ProjectModel.find({}, (err, projects) => {
    if (err) {
      res.statusCode = 500;
      res.json({
        error: err
      });
    } else {
      res.statusCode = 200;
      res.json({ projects });
    }
    if (callback) return callback();
  });
}

/**
 * @swagger
 * /projects:
 *   post:
 *     tags:
 *       - Projects
 *     description: Create a new project in the bucket service.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: description
 *         description: Name and Description of new project in bucket service
 *         in: body
 *         schema:
 *           type: object
 *           required:
 *             - name
 *           properties:
 *             name:
 *               type: string
 *             description:
 *               type: string
 *             appAreas:
 *               type: array
 *     responses:
 *       201:
 *        description: All OK! Route execution was successful and response was returned.
 *       400:
 *        description: Record is invalid.
 *       409:
 *        description: Conflict. Resource with name already exists.
 *       500:
 *        description: Internal server error occurred. Please create an issue on github repo.
 */
function createOne({ body }, res, callback) {
  const name = sanitize(body.name);
  const description = sanitize(body.description);
  const appAreas = sanitize(body.appAreas);
  if (isValidProjectRecord(body)) {
    ProjectModel.find({ name: name }, (findErr, { length }) => {
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
          error: `Conflict: Resource with name '${body.name}' already exists.`
        });
        if (callback) return callback();
      } else {
        const newProject = new ProjectModel({
          name: name,
          description: description,
          appAreas: _.compact(appAreas)
        });
        // Everything is perfect. Save!
        newProject.save((saveErr, p) => {
          if (saveErr) {
            res.statusCode = 500;
            res.json({
              error: saveErr
            });
          } else {
            res.statusCode = 201;
            res.json({ project: p });
          }
          if (callback) return callback();
        });
      }
    });
  } else {
    // not a valid record
    res.statusCode = 400;
    res.json({
      error: `Record is invalid. Expecting ${getRequiredKeys().toString()}`
    });
    if (callback) return callback();
  }
}

/**
 * @swagger
 * /projects/{name}:
 *   put:
 *     tags:
 *       - Projects
 *     description: Update a project in the bucket service (***NOTE***- If AppArea array is provided, make sure its the complete entity you need against the project.)
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         description: Name of the project
 *         in: path
 *         required: true
 *       - name: payload
 *         description: Payload to add new project in bucket service
 *         in: body
 *         schema:
 *           type: object
 *           required:
 *             - name
 *           properties:
 *             name:
 *               type: string
 *             description:
 *               type: string
 *             appAreas:
 *               type: array
 *     responses:
 *       200:
 *        description: All OK! Route execution was successful and response was returned.
 *       404:
 *        description: Resource with name not found.
 *       500:
 *        description: Internal server error occurred. Please create an issue on github repo.
 */
function updateOne({ params, body }, res, callback) {
  const findName = sanitize(params.name);
  const newName = sanitize(body.name);
  const description = sanitize(body.description);
  const appAreas = sanitize(body.appAreas);
  ProjectModel.find({ name: findName }, (findErr, projects) => {
    if (findErr) {
      res.statusCode = 500;
      res.json({
        error: findErr
      });
      if (callback) return callback();
    } else if (projects.length !== 0) {
      const project = projects[0];
      if (Object.prototype.hasOwnProperty.call(body, 'name') && newName) project.name = newName;
      if (Object.prototype.hasOwnProperty.call(body, 'description') && description) project.description = description;
      if (Object.prototype.hasOwnProperty.call(body, 'appAreas') && appAreas) project.appAreas = appAreas;

      project.save((saveErr, p) => {
        if (saveErr) {
          res.statusCode = 500;
          res.json({
            error: saveErr
          });
        } else {
          res.statusCode = 200;
          res.json({ project: p });
          if (callback) return callback();
        }
      });

    } else {
      res.statusCode = 404;
      res.json({
        error: `Resource with name: ${params.name} not found.`
      });
      if (callback) return callback();
    }
  });
}

/**
 * @swagger
 * /projects/{name}:
 *   delete:
 *     tags:
 *       - Projects
 *     description: Get information about the project.
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: name
 *         description: Project you want to delete
 *         in: path
 *         required: true
 *         type: string
 *         example: "Barracuda"
 *     responses:
 *       200:
 *        description: All OK! Route execution was successful and response was returned.
 *       400:
 *        description: The required input parameters were NOT provided.
 *       500:
 *        description: Internal server error occurred. Please create an issue on github repo.
 */
function deleteOne({ params }, res, callback) {
  const name = sanitize(params.name);
  ProjectModel.find({ name: name }, (findErr, projects) => {
    if (findErr) {
      res.statusCode = 500;
      res.json({
        error: findErr
      });
      if (callback) return callback();
    } else if (projects.length !== 0) {
      const project = projects[0];
      project.remove(removeErr => {
        if (removeErr) {
          res.statusCode = 500;
          res.json({
            error: removeErr
          });
        } else {
          res.statusCode = 200;
          res.json({
            message: 'Project successfully deleted.'
          });
        }
        if (callback) return callback();
      });
    } else {
      res.statusCode = 404;
      res.json({
        error: `Resource with name: ${params.name} not found.`
      });
      if (callback) return callback();
    }
  });
}

/**
 * @swagger
 * /projects/search/{field}:
 *   get:
 *     tags:
 *       - Projects
 *     description: Search for projects based on a field
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: field
 *         description: Field name you want to search on.
 *         in: path
 *         required: true
 *         type: string
 *         default: "name"
 *         enum:
 *          - name
 *          - description
 *          - appAreas
 *       - name: q
 *         description: actual query on the field.
 *         in: query
 *         required: false
 *         type: string
 *         default: ""
 *     responses:
 *       200:
 *        description: All OK! Route execution was successful and response was returned.
 *       400:
 *        description: The required input parameters were NOT provided.
 *       500:
 *        description: Internal server error occurred. Please create an issue on github repo.
 */
function searchField(req, res, callback) {
  const field = sanitize(req.params.field);
  let q = req.query.q || '';
  q = escapeStringRegexp(q);
  const search = new RegExp(q, 'i');
  const query = {
    [field]: { $regex: search }
  };
  ProjectModel.find(query, (err, projects) => {
    if (err) {
      res.statusCode = 500;
      res.json({
        error: err
      });
    } else {
      res.statusCode = 200;
      res.json({ projects });
    }
    if (callback) return callback();
  });
}

function getRequiredKeys() {
  return ['name'];
}

function isValidProjectRecord(project) {
  if (!project) return false;
  return getRequiredKeys().every(key => project[key]);
}

function register(app) {
  app.get('/projects/', getAll);
  app.get('/projects/search/:field', searchField);
  app.get('/projects/:name', getOne);
  app.post('/projects/', createOne);
  app.put('/projects/:name', updateOne);
  app.delete('/projects/:name', deleteOne);
}

module.exports = {
  register,
  getAll,
  getOne,
  createOne,
  updateOne,
  deleteOne,
  searchField,
  isValidProjectRecord
};
