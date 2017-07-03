# We Know You Don't Floss

Example Alexa skill that will retrieve a linked users appointment time and let them know about an ongoing promotion.

Account linking is through Login with Amazon.

Dev Setup:
* Rename the values with in deploy.env.json.example to deploy.env.json and replace values before deploying.
* If updating node modules, replace the node_modules in the dist directory with --only=production dependencies

AWS Dependencies:
* Lambda with AmazonDynamoDBReadOnlyAccess and AWSLambdaBasicExecutionRole policies
* DynamoDB tables for promotions and appointment times
* Login with Amazon enabled and setup in skill Account Link.