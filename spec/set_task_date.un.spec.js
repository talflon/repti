'use strict';

const fs = require('fs')
const path = require('path')

const got = require('got');
const tmp = require('tmp')
tmp.setGracefulCleanup()
const dayjs = require('dayjs')
const mockdate = require('mockdate')

const {createServer} = require('../server.js');
const {DataStorage, daynum} = require('../data.js');

const PORT = 9598;

describe("the HTTP server", () => {
  beforeEach(async () => {
    this.storageDir = tmp.dirSync().name
    this.userCode = 'the-secret'
    this.server = await createServer('localhost', PORT, this.storageDir)
    fs.writeFileSync(path.join(this.storageDir, this.userCode + '.json'), '')
    this.ROOT_URL = this.server.url + '/' + this.userCode
    this.storage = new DataStorage(this.storageDir)
  });

  afterEach(async () => {
    await this.server.close();
    mockdate.reset();
  });

  const add_task = (id, values) => {
    let data = this.storage.get(this.userCode)
    data.order.push(id)
    data.tasks[id] = values
    this.storage.put(this.userCode, data)
  }

  const get_task = (id) => this.storage.get(this.userCode).tasks[id]

  it("reloads after a POST to /tasks/id", async () => {
    add_task('blah', { name: 'meh' })
    const response = await got.post(this.ROOT_URL + '/tasks/blah')
    expect(response.url).toBe(this.ROOT_URL + '/');
  });

  it("sets a date on POST to /tasks/id when initially blank", async () => {
    const id = 'one', d = 123;
    add_task('one', { name: 'um' })
    await got.post(this.ROOT_URL + '/tasks/' + id, {
      form: {
        task_date: d
      }
    })
    expect(get_task(id).done).toBe(d)
  });

  it("sets a newer date on POST to /tasks/id", async () => {
    const id = 'id', d = 9876;
    add_task(id, { name: 'name', done: 52 })
    await got.post(this.ROOT_URL + '/tasks/' + id, {
      form: {
        task_date: d
      }
    })
    expect(get_task(id).done).toBe(d)
  });

  it("sets an older date on POST to /tasks/id", async () => {
    const id = 'nha', d = 46;
    add_task(id, { name: 'ma', done: 77 })
    await got.post(this.ROOT_URL + '/tasks/' + id, {
      form: {
        task_date: d
      }
    })
    expect(get_task(id).done).toBe(d)
  });

  it("sets date to today on POST to /tasks/id with task_date: 'today'", async () => {
    const id = 'eyedee', fake_day = dayjs('2022-01-02 3:45');
    add_task(id, { name: 'nemm' })
    mockdate.set(fake_day)
    await got.post(this.ROOT_URL + '/tasks/' + id, {
      form: {
        task_date: 'today'
      }
    })
    expect(get_task(id).done).toBe(daynum(fake_day))
   })
});
