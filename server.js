'use strict';

const {once} = require('events')
const express = require('express')

async function createServer(hostname, port) {
  let app = express();
  app.set('views', './templates');
  app.set('view engine', 'hbs');
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/', (req, res) => {
    res.render('index', { });
  });

  let listener = app.listen(port, hostname);
  await once(listener, 'listening');
  return {app, listener,
    url: `http://${hostname}:${port}`,
    close: () => { listener.close() },
  };
}

exports.createServer = createServer;
