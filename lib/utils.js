import _ from 'lodash';

function getDifference(oldBuckets, newBuckets) {
  const oldTags = extractTags(oldBuckets);
  const newTags = extractTags(newBuckets);
  return { oldTags: _.difference(oldTags, newTags), newTags: _.difference(newTags, oldTags) };
}

function getObjForTag(metaInfo, tag) {
  if (!metaInfo) return null;

  const key = Object.keys(metaInfo).find(metaInfoKey => {
    if (!metaInfo[metaInfoKey] || typeof metaInfo[metaInfoKey] !== 'object') return false;
    return metaInfo[metaInfoKey].currentBucket === tag;
  });

  if (!key) return null;
  return {
    metaObj: metaInfo[key],
    key
  };
}

function extractTags(matchBucket) {
  if (Array.isArray(matchBucket)) return matchBucket;
  if (typeof matchBucket !== 'string') return [];

  return matchBucket.match(/\[[^\]]+\]/g);
}

function filterTags(tagsArray, filterWith) {
  if (!tagsArray) return [];
  return tagsArray.filter(tag => tag.endsWith(filterWith));
}

export default {
  getDifference,
  getObjForTag,
  extractTags,
  filterTags
};
