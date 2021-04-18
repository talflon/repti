'use strict';

const {createServer} = require('./server.js')

const hostname = '127.0.0.1';
const port = 8000;

(async () => {
  let server = await createServer(hostname, port);
  console.log(`Repti server running at ${server.url}`);
})();

