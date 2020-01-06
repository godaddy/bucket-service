const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  name: String, // required field
  description: String,
  appAreas: [String], default: []
});
module.exports = mongoose.model('Project', projectSchema);
