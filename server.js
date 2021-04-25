'use strict';

const {once} = require('events')

const express = require('express')

const {newTaskId} = require('./data.js')

async function createServer(hostname, port) {
  let app = express();
  app.set('views', './templates');
  app.set('view engine', 'hbs');
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  let data = {
    "order": [],
    "tasks": {}
  };

  app.get('/', (req, res) => {
    res.render('index', { data,
      tasks: data.order.map(task_id => data.tasks[task_id])
    })
  });

  app.post('/tasks', (req, res) => {
    let task_id = newTaskId(data.order)
    data.tasks[task_id] = {name: req.body.task_name};
    data.order.push(task_id)
    res.redirect(303, 'back')
  });

  let listener = app.listen(port, hostname);
  await once(listener, 'listening');
  return {app, listener, data,
    url: `http://${hostname}:${port}`,
    close: () => { listener.close() },
  };
}

exports.createServer = createServer;
