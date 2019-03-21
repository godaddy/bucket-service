import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const testSchema = new Schema({
  name: String,
  bucket: String,
  uuid: String,
  project: String,
  appArea: String,
  metaInfo: { type: Schema.Types.Mixed, default: {} } // {_id1 => {currentBucket: "", lastKnownBucket: "", bucketUpdatedAt: ""}, _id2 => {...}}
});
export default mongoose.model('Test', testSchema);
