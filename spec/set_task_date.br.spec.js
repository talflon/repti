'use strict';

const fs = require('fs')
const path = require('path')

const tmp = require('tmp')
tmp.setGracefulCleanup()
const {By, Key, until} = require('selenium-webdriver');
const dayjs = require('dayjs')
const mockdate = require('mockdate')

const {createServer} = require('../server.js');
const {DataStorage, daynum} = require('../data.js');
const {createBrowser} = require('./lib/browser.js');
const {sleep} = require('./lib/util.js')

const PORT = 7345;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000

describe("Homepage", () => {
  const startServer = async () => {
    this.server = await createServer('localhost', PORT, this.storageDir)
  }

  const stopServer = async () => {
    if (this.server) {
      await this.server.close()
      delete this.server
    }
  }

  const startBrowser = async () => {
    this.browser = await createBrowser()
  }

  const stopBrowser = async () => {
    if (this.browser) {
      await this.browser.quit()
      delete this.browser
    }
  }

  beforeEach(async () => {
    this.storageDir = tmp.dirSync().name
    this.userCode = 'some-secret'
    fs.writeFileSync(path.join(this.storageDir, this.userCode + '.json'), '')
    await Promise.all([startServer(), startBrowser()]);
    this.ROOT_URL = this.server.url + '/d/' + this.userCode
    this.storage = new DataStorage(this.storageDir)
  });

  afterEach(async () => {
    await Promise.all([stopBrowser(), stopServer()])
    mockdate.reset()
  });

  const getList = () => {
    return this.browser.wait(until.elementLocated(By.id('task_list')));
  }

  const getListTexts = async () => {
    let list_table = await getListTable();
    let rows = await list_table.findElements(By.tagName('tr'));
    return await Promise.all(rows.map(row => row.getText()));
  }

  const add_task = (id, values) => {
    let data = this.storage.get(this.userCode)
    data.order.push(id)
    data.tasks[id] = values
    this.storage.put(this.userCode, data)
  }

  const get_task = (id) => this.storage.get(this.userCode).tasks[id]

  it("shows the task days ago when 0", async () => {
    const d = dayjs('2021-09-03 10:01')
    mockdate.set(d)
    add_task('anid', { name: 'aname', done: daynum(d) })
    await this.browser.get(this.ROOT_URL);
    expect((await getList().getText())).toContain('0');
  });

  it("shows the task days ago when positive", async () => {
    const d = dayjs('2021-11-30 00:00')
    mockdate.set(d)
    add_task('the-id', { name: 'anything', done: daynum(d) - 16 })
    await this.browser.get(this.ROOT_URL);
    let list_text = await getList().getText()
    expect(list_text).toContain('16');
    expect(list_text).not.toContain('-16');
  });

  it("sets the task date to today when done button clicked", async () => {
    const id = 'asdf'
    add_task(id, { name: 'N' })
    await this.browser.get(this.ROOT_URL);
    let row = await this.browser.wait(until.elementLocated(By.id('task-' + id)))
    let button = await row.findElement(By.xpath(".//button[@type='submit'][@name='task_date'][@value='today']"))
    await button.click()
    await sleep(500)
    await getList()
    expect(get_task(id).done).toBe(daynum())
  });

  it("hides the reset button behind accordion", async () => {
    const id = 'g'
    add_task(id, { name: 'z', done: 94 })
    await this.browser.get(this.ROOT_URL);
    let row = await this.browser.wait(until.elementLocated(By.id('task-' + id)))
    let button = await row.findElement(By.xpath(".//button[@type='submit'][@name='task_date'][@value='reset']"))
    expect(await button.isDisplayed()).toBeFalsy()
    await row.click()  // open accordion
    expect(await button.isDisplayed()).toBeTruthy()
  });

  it("resets the task date when reset button clicked", async () => {
    const id = 'k'
    add_task(id, { name: 'n', done: 54321 })
    await this.browser.get(this.ROOT_URL);
    let row = await this.browser.wait(until.elementLocated(By.id('task-' + id)))
    await row.click()  // open accordion
    let button = await row.findElement(By.xpath(".//button[@type='submit'][@name='task_date'][@value='reset']"))
    await button.click()
    await sleep(500)
    await getList()
    expect(get_task(id).done).toBeFalsy()
    expect(get_task(id).done).not.toBe(0)
  });
});
