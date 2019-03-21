# Calling the bucket service API

Sample in python:

``` python
#!/usr/bin/env python

import os
import requests
import json
import urllib.parse

bucket_service_url = 'http://localhost:8080'
project = urllib.parse.quote_plus(os.environ.get('PROJECT'))
bucket = urllib.parse.quote_plus(os.environ.get('BUCKET'))
uuid = urllib.parse.quote_plus(os.environ.get('UUID'))

## 1st API request - Creates a project in the bucket service
r = requests.post(bucket_service_url + '/projects/', json={"name": project, "description": "Example Project Barracuda"})
print(json.loads(r.text))

## 2nd API request - Adds a test to the project in the bucket service
r = requests.post(bucket_service_url + '/projects/' + project + '/tests/', json={"bucket": '[' + bucket + ']', "name": "Example Test Name", "uuid": uuid})
print(json.loads(r.text))

## 3rd API request - Retrieves all tests in the specified bucket
r = requests.get(bucket_service_url + '/projects/' + project + '/tests/search/bucket?q=[' + bucket + ']')
print(json.loads(r.text))

## Write examples to file, to be read by shell script that runs the tests
examples = ''
for test in r.json()['tests']:
    examples += '--example ' + test['uuid'] + ' ' # This is how you can run specific ruby rspec tests

filename = "examples.txt"
f = open(filename, "w+")
f.write(examples)
f.close()
```
Run the above like : `PROJECT=Barracuda BUCKET=dt_chrome_regression UUID=test-00001 python3 <your file name here>.py`
