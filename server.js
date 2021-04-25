'use strict';

const {once} = require('events')
const fs = require('fs')

const express = require('express')
const stoppable = require('stoppable')

const {newTaskId, DataStorage} = require('./data.js')

async function createServer(hostname, port, storageDir) {
  const server = {}

  server.app = express();
  server.app.set('views', './templates');
  server.app.set('view engine', 'hbs');
  server.app.use(express.json());
  server.app.use(express.urlencoded({ extended: true }));

  fs.opendirSync(storageDir).closeSync()
  server.storageDir = storageDir
  server.storage = new DataStorage(storageDir)

  server.app.get('/:userCode', (req, res) => {
    let data = server.storage.get(req.params.userCode)
    if (!data) {
      return res.sendStatus(404)
    }
    res.render('index', {
      data,
      userCode: req.params.userCode,
      tasks: data.order.map(task_id => data.tasks[task_id])
    })
  });

  server.app.post('/:userCode/tasks', (req, res) => {
    let data = server.storage.get(req.params.userCode)
    if (!data) {
      return res.sendStatus(404)
    }
    let task_id = newTaskId(data.order)
    data.tasks[task_id] = {name: req.body.task_name};
    data.order.push(task_id)
    server.storage.put(req.params.userCode, data)
    res.redirect(303, '/' + req.params.userCode + '/')
  });

  let listener = server.app.listen(port, hostname);
  await once(listener, 'listening');
  server.url = `http://${hostname}:${port}`;
  server.close = stoppable(listener, 500).stop
  return server
}

exports.createServer = createServer;
