import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const projectSchema = new Schema({
  name: String, // required field
  description: String,
  appAreas: [String], default: []
});
export default mongoose.model('Project', projectSchema);
