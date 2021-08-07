'use strict';

const fs = require('fs')
const path = require('path')

const got = require('got');
const tmp = require('tmp')
tmp.setGracefulCleanup()

const {createServer} = require('../server.js');
const {DataStorage} = require('../data.js');

const PORT = 9598;

describe("Test the server", () => {
  beforeEach(async () => {
    this.storageDir = tmp.dirSync().name
    this.userCode = 'my-secret'
    this.server = await createServer('localhost', PORT, this.storageDir)
    fs.writeFileSync(path.join(this.storageDir, this.userCode + '.json'), '')
    this.ROOT_URL = this.server.url + '/d/' + this.userCode
    this.storage = new DataStorage(this.storageDir)
  });

  afterEach(async () => {
    await this.server.close();
  });

  it("reloads after a POST to /tasks", async () => {
    const response = await got.post(this.ROOT_URL + '/tasks')
    expect(response.url).toBe(this.ROOT_URL + '/');
  });

  it("adds a task after a POST to /tasks", async () => {
    await got.post(this.ROOT_URL + '/tasks', {
      form: {
        task_name: 'read'
      }
    });
    let data = this.storage.get(this.userCode)
    let tasks = data.tasks
    let task_id = Object.getOwnPropertyNames(tasks).find(i => tasks[i].name === 'read')
    expect(task_id).toBeDefined()
    expect(data.order).toContain(task_id)
  });

  it("keeps old task on POST to /tasks", async () => {
    let data = this.storage.get(this.userCode)
    data.order = ['first']
    data.tasks.first = { name: 'first!' }
    this.storage.put(this.userCode, data)
    await got.post(this.ROOT_URL + '/tasks', {
      form: {
        task_name: 'second'
      }
    });
    data = this.storage.get(this.userCode)
    expect(data.order).toContain('first')
    expect(data.tasks.first).toBeDefined()
    expect(data.tasks.first.name).toBe('first!')
  });

  it("adds new tasks to different task_ids by POST to /tasks", async () => {
    let data = this.storage.get(this.userCode)
    data.order = ['first']
    data.tasks.first = { name: 'first!' }
    this.storage.put(this.userCode, data)
    await got.post(this.ROOT_URL + '/tasks', {
      form: {
        task_name: 'another'
      }
    });
    await got.post(this.ROOT_URL + '/tasks', {
      form: {
        task_name: 'last'
      }
    });
    data = this.storage.get(this.userCode)
    expect([...new Set(data.order)].length).toBe(3)
  });

  it("shows task name in body", async () => {
    let data = this.storage.get(this.userCode)
    let task_id = 'test'
    let task_name = 'TEST'
    data.order = [task_id]
    data.tasks[task_id] = { name: task_name }
    this.storage.put(this.userCode, data)
    const res = await got(this.ROOT_URL)
    expect(res.body).toContain(task_name)
  });

  it("shows multiple tasks in body", async () => {
    let data = this.storage.get(this.userCode)
    data.order = ['id1', 'id2']
    data.tasks.id1 = { name: 'subi' }
    data.tasks.id2 = { name: 'dixi' }
    this.storage.put(this.userCode, data)
    const res = await got(this.ROOT_URL)
    expect(res.body).toContain('subi')
    expect(res.body).toContain('dixi')
   });
});
