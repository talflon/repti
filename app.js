'use strict';

const config = require('config');
const {createServer} = require('./server.js');

(async () => {
  let server = await createServer(config.get('server.hostname'), config.get('server.port'), config.get('server.storageDir'));
  console.log(`Repti server running at ${server.url} with storage in ${server.storageDir}`);
})();
