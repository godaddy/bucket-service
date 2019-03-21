# Bucket Service

The bucket service is useful for enabling or disabling tests without a code change. It is also useful for running a subset of tests based on which tests are in a specific bucket. This is extremely useful if your pipeline is blocked due to a failing test, but you still want to move forward. Instead of having to make a commit and rebuilding your project, you could use this service to remove that test from running. To get this to work, you will need MongoDB to store all the data.

The purpose of the bucket service is to allow you to run certain tests that are part of a bucket. This also allows you to disable and enable tests without making a code change. For example, you may add the bucket `[dt_chrome_regression]` to all tests that should run as part of your desktop chrome regression test suite. You can add as many buckets to a test as you like. One test may have `[dt_chrome_regression]` and `[dt_firefox_regression]`, and another test may have `[dt_ie_regression]`. This means that you can run all tests with the bucket `[dt_chrome_regression]`, and it would not run the tests without that bucket.

## Configuration

The following environment variables are used. Change them if you would like different values.  

|Environment Variable|Description                                                        |Default  |
|--------------------|-------------------------------------------------------------------|----------
|BUCKET_MONGOHOST    |This is the MongoDB hostname.                                      |localhost|
|BUCKET_MONGODB      |This is the MongoDB database.                                      |test     |
|NODE_PORT           |This is the port that the bucket service will run on.              |8080     |

## Requirements

### Node.js

We have tested this on Node 8.9.0 and 10.15.0. We use async/await, so you will need at least Node 8 or greater.

### MongoDB

You will need at least MongoDB 3.0 or greater. Anything lower is not compatible with the version of Mongoose used and Node.js needed.

All of the data from the bucket service is stored in a MongoDB. To get a MongoDB setup using docker, follow these steps (Requires [Docker](#installing-docker)) :  
```
mkdir ~/data
docker run -d -p 27017:27017 -v ~/data:/data/db mongo
```

### Docker

Docker is not required, however if you would like to use the MongoDB docker image, you will need docker.

#### Installing Docker
https://docs.docker.com/docker-for-mac/install/  
https://docs.docker.com/docker-for-windows/install/  
https://docs.docker.com/install/linux/docker-ce/ubuntu/

## Start Bucket Service

After starting MongoDB, you can start the bucket service:  
```
npm run start
```

## Bucket Service Usage:

### Steps to use bucket service
1) Create a project in the bucket service ( POST /projects ) [See the 1st API request](#calling-the-bucket-service-api)
2) Add test to the bucket service under a specific project ( POST /projects/{project}/tests ) [See the 2nd API request](#calling-the-bucket-service-api)
3) When running the tests, fetch all tests for desired bucket ( GET /projects/{project}/tests/bucket?q={bucket} ) [See the 3rd API request](#calling-the-bucket-service-api)

### Calling the bucket service API

Sample in javascript:

* First `npm install axios`

``` javascript
const axios = require('axios');
const fs = require('fs');

const bucket_service_url = 'http://localhost:8080';
const project = encodeURIComponent(process.env.PROJECT);
const bucket = encodeURIComponent(process.env.BUCKET);
const uuid = encodeURIComponent(process.env.UUID);

// 1st API request - Creates a project in the bucket service
async function addProject() {
  const projectData = {
    name: project,
    description: 'Example Project Barracuda'
  };
  return axios.post(`${bucket_service_url}/projects`, projectData);
}

// 2nd API request - Adds a test to the project in the bucket service
async function addTest() {
  const testData = {
    bucket: `[${bucket}]`,
    name: 'Example Test Name',
    uuid
  };
  return axios.post(`${bucket_service_url}/projects/${project}/tests`, testData);
}

// 3rd API request - Retrieves all tests in the specified bucket
async function getTests() {
  return axios.get(`${bucket_service_url}/projects/${project}/tests/search/bucket?q=[${bucket}]`);
}

async function main() {
  let r = await addProject();
  console.log(`Response from Adding Project : ${JSON.stringify(r.data, null, 2)}`);
  r = await addTest();
  console.log(`Response from Adding Test : ${JSON.stringify(r.data, null, 2)}`);
  r = await getTests();
  // Write examples to file, to be read by shell script that runs the tests
  let examples = '';
  const tests = r.data.tests;
  console.log(`Response from Get Tests : ${JSON.stringify(tests, null, 2)}`);
  for (let i = 0; i < tests.length; i++) {
    examples += `--example ${tests[i].uuid}`;
  }
  fs.writeFile('examples.txt', examples, function(err) {
    if (err) {
      return console.log(err);
    }
  });
}

main();
```
Run the above like : `PROJECT=Barracuda BUCKET=dt_chrome_regression UUID=test-00001 node <your file name here>.js`

See this example in [Ruby](docs/ruby.md), [Python](docs/python.md)


Shell script to run ruby tests
``` bash
#!/bin/bash

BUCKET=dt_chrome_regression PROJECT=Barracuda python3 <your python file name here>.py
EXAMPLES=`cat examples.txt` # Filename from python script above

if [[ ! -z "${EXAMPLES}" ]]; then
  bundle exec rspec spec/features/ ${EXAMPLES} --profile 3 --format documentation --format RspecJunitFormatter --out build/test/results.xml &
  
  chromepid=$!

  wait $chromepid
  chromecode=$?

  if [ $chromecode -ne 0 ]; then
    exit 1
  fi
fi
```
Run the above like : `<your shell script file name here>.sh`

## Swagger Docs

First start the server then access  http://localhost:8080/docs/


\* The bucket service is originally from https://github.com/azweb76/node-test-api/
