const assert = require('assert');
const getDifference = require('../../lib/utils').getDifference;
const extractTags = require('../../lib/utils').extractTags;
const filterTags = require('../../lib/utils').filterTags;
const getObjForTag = require('../../lib/utils').getObjForTag;

describe('Utils', () => {

  it('getDifference should return the difference in tags', done => {
    const oldTags = '[dt_chrome_regression_new] [dt_ie_regression]';
    const newTags = '[dt_chrome_regression] [dt_ie_regression]';
    const difference = getDifference(oldTags, newTags);
    assert.deepEqual(difference, { oldTags: ['[dt_chrome_regression_new]'], newTags: ['[dt_chrome_regression]'] });
    done();
  });

  it('extractTags should return a list of valid tags from a string', done => {
    const matchBucket = '[dt_chrome_regression] [dt_ie_regression]';
    const tags = extractTags(matchBucket);
    assert.deepEqual(tags, ['[dt_chrome_regression]', '[dt_ie_regression]']);
    done();
  });

  it('extractTags should return the matchBucket if it is an array', done => {
    const matchBucket = ['[dt_chrome_regression]', '[dt_ie_regression]'];
    const tags = extractTags(matchBucket);
    assert.deepEqual(tags, matchBucket);
    done();
  });

  it('extractTags should return an empty array if matchBucket not array and not string', done => {
    const matchBucket = false;
    const tags = extractTags(matchBucket);
    assert.deepEqual(tags, []);
    done();
  });

  it('filterTags should return a list of tags that end with a specific string', done => {
    const extractedTags = ['[dt_chrome_regression_new]', '[dt_ie_regression]'];
    const newTags = filterTags(extractedTags, '_new]');
    assert.deepEqual(newTags, ['[dt_chrome_regression_new]']);
    done();
  });

  it('filterTags should return an empty array if no tagsArray', done => {
    const tagsArray = null;
    const newTags = filterTags(tagsArray, '_new]');
    assert.deepEqual(newTags, []);
    done();
  });

  it('getObjForTag should return the meta data for the correct current bucket', done => {
    const metaInfo = {
      '59f26864274f9a0800049b40': {
        bucketUpdatedAt: '2018-04-30T18:03:06.650Z',
        currentBucket: null,
        lastKnownBucket: '[dt_safari_regression_tut]'
      },
      '5919ef2665e0720600adea3e': {
        bucketUpdatedAt: '2017-05-15T18:10:46.032Z',
        currentBucket: '[dt_chrome_regression_new]',
        lastKnownBucket: '[dt_chrome_regression_tut]'
      }
    };
    const expectedObject = {
      key: '5919ef2665e0720600adea3e',
      metaObj: {
        bucketUpdatedAt: '2017-05-15T18:10:46.032Z',
        currentBucket: '[dt_chrome_regression_new]',
        lastKnownBucket: '[dt_chrome_regression_tut]'
      }
    };
    const tag = '[dt_chrome_regression_new]';
    const obj = getObjForTag(metaInfo, tag);
    assert.deepEqual(obj, expectedObject);
    done();
  });

  it('getObjForTag should return null if no metadata', done => {
    const metaInfo = null;
    const tag = '[dt_chrome_regression_new]';
    const obj = getObjForTag(metaInfo, tag);
    assert.deepEqual(obj, null);
    done();
  });

});
