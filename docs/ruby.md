# Calling the bucket service API

Sample in ruby:

* First `gem install faraday`

``` ruby
require 'faraday'
require 'json'
require 'uri'

bucket_service_url = 'http://localhost:8080'
project = URI::encode(ENV['PROJECT'])
bucket = URI::encode(ENV['BUCKET'])
uuid = URI::encode(ENV['UUID'])

conn = Faraday.new bucket_service_url

## 1st API request - Creates a project in the bucket service
project_data = {
  name: project,
  description: 'Example Project Barracuda'
}
r = conn.post 'projects', project_data
puts r.body

## 2nd API request - Adds a test to the project in the bucket service
test_data = {
  bucket: "[#{bucket}]",
  name: 'Example Test Name',
  uuid: uuid
}
r = conn.post "projects/#{project}/tests", test_data
puts r.body

## 3rd API request - Retrieves all tests in the specified bucket
r = conn.get "projects/#{project}/tests/search/bucket?q=[#{bucket}]"
puts r.body

## Write examples to file, to be read by shell script that runs the tests
tests = JSON.parse(r.body)['tests']

examples = ''
tests.each do |test|
  examples += "--example #{test['uuid']} "
end

File.open('examples.txt', 'w') { |file| file.write(examples) }
```
Run the above like : `PROJECT=Barracuda BUCKET=dt_chrome_regression UUID=test-00001 ruby <your file name here>.rb`
