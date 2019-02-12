# uipath-webhooks

Simple Node.JS helper module for Webhook based integration.

### Table of content

1. [Installation](#installation)
2. [Usage](#usage)
3. [License](#license)

### Installation

`npm install uipath-webhooks`

### Usage

```javascript
var util = require('util');
var WebhookServer = require('uipath-webhooks').WebhookServer;

var SECRET = 'abcdef';
var PORT = 3000;

var server = new WebhookServer(SECRET);

server.on('job.faulted', function (event) {
        console.log(util.inspect(event));
});

server.listen(PORT);

```

### License

MIT