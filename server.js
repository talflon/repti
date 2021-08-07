'use strict';

const {once} = require('events')
const fs = require('fs')
const path = require('path')

const express = require('express')
const stoppable = require('stoppable')

const {newTaskId, DataStorage, daynum} = require('./data.js')

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

  function task_for_template(id, task) {
    task = Object.assign({}, task)
    task.id = id
    if (task.done == null) {
      task.daysAgo = '—'
    } else {
      task.daysAgo = daynum() - task.done
    }
    return task
  }

  server.app.use('/', express.static(path.join(__dirname, 'static')))

  server.app.get('/d/:userCode/', (req, res) => {
    let data = server.storage.get(req.params.userCode)
    if (!data) {
      return res.sendStatus(404)
    }
    if (!req.url.endsWith('/')) {
      res.redirect(301, req.url + '/')
    } else {
      res.render('index', {
        data,
        userCode: req.params.userCode,
        tasks: data.order.map(task_id => task_for_template(task_id, data.tasks[task_id]))
      })
    }
  });

  server.app.post('/d/:userCode/tasks', (req, res) => {
    let data = server.storage.get(req.params.userCode)
    if (!data) {
      return res.sendStatus(404)
    }
    let task_id = newTaskId(data.order)
    data.tasks[task_id] = {name: req.body.task_name};
    data.order.push(task_id)
    server.storage.put(req.params.userCode, data)
    res.redirect(303, '/d/' + req.params.userCode + '/')
  });

  function parseDay(dayStr) {
    if (dayStr === 'today') {
      return daynum()
    } else {
      return parseInt(dayStr)
    }
  }

  server.app.post('/d/:userCode/tasks/:taskId', (req, res) => {
    let data = server.storage.get(req.params.userCode)
    let task = data.tasks[req.params.taskId]
    if (!task) {
      return res.sendStatus(404)
    }

    let day = parseDay(req.body.task_date)
    if (!isNaN(day)) {
      task.done = day
    }
    server.storage.put(req.params.userCode, data)
    res.redirect(303, '/d/' + req.params.userCode + '/')
  });

  let listener = server.app.listen(port, hostname);
  await once(listener, 'listening');
  server.url = `http://${hostname}:${port}`;
  server.close = stoppable(listener, 500).stop
  return server
}

exports.createServer = createServer;
