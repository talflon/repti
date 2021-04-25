'use strict';

const got = require('got');

const {createServer} = require('../server.js');

const PORT = 9598;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

describe("Test the server", () => {
  beforeEach(async () => {
    this.server = await createServer('localhost', PORT);
    this.ROOT_URL = this.server.url;
  });

  afterEach(async () => {
    await this.server.close();
  });

  it("reloads after a POST to /tasks", async () => {
    const response = await got.post(this.server.url + '/tasks')
    expect(response.url).toBe(this.server.url + '/');
  });

  it("adds a task after a POST to /tasks", async () => {
    await got.post(this.server.url + '/tasks', {
      form: {
        task_name: 'read'
      }
    });
    let tasks = this.server.data.tasks
    let task_id = Object.getOwnPropertyNames(tasks).find(i => tasks[i].name === 'read')
    expect(task_id).toBeDefined()
    expect(this.server.data.order).toContain(task_id)
  });

  it("keeps old task on POST to /tasks", async () => {
    this.server.data.order = ['first']
    this.server.data.tasks.first = { name: 'first!' }
    await got.post(this.server.url + '/tasks', {
      form: {
        task_name: 'second'
      }
    });
    expect(this.server.data.order).toContain('first')
    expect(this.server.data.tasks.first).toBeDefined()
    expect(this.server.data.tasks.first.name).toBe('first!')
  });

  it("adds new tasks to different task_ids by POST to /tasks", async () => {
    this.server.data.order = ['first']
    this.server.data.tasks.first = { name: 'first!' }
    await got.post(this.server.url + '/tasks', {
      form: {
        task_name: 'another'
      }
    });
    await got.post(this.server.url + '/tasks', {
      form: {
        task_name: 'last'
      }
    });
    expect([...new Set(this.server.data.order)].length).toBe(3)
  });

  it("shows task name in body", async () => {
    let task_id = 'test'
    let task_name = 'TEST'
    this.server.data.order = [task_id]
    this.server.data.tasks[task_id] = { name: task_name }
    const res = await got(this.server.url)
    expect(res.body).toContain(task_name)
  });

  it("shows multiple tasks in body", async () => {
    this.server.data.order = ['id1', 'id2']
    this.server.data.tasks.id1 = { name: 'subi' }
    this.server.data.tasks.id2 = { name: 'dixi' }
    const res = await got(this.server.url)
    expect(res.body).toContain('subi')
    expect(res.body).toContain('dixi')
   });
});
