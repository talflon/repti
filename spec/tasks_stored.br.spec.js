'use strict';

const path = require('path')
const fs = require('fs')

const tmp = require('tmp')
tmp.setGracefulCleanup()

const {By, Key, until} = require('selenium-webdriver');

const {createServer} = require('../server.js');
const {createBrowser} = require('./lib/browser.js');
const {sleep} = require('./lib/util.js')

const PORT = 8765;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000

describe("data preserved", () => {
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
    this.userCode = 'a-secret'
    fs.writeFileSync(path.join(this.storageDir, this.userCode + '.json'), '')
    await Promise.all([startServer(), startBrowser()]);
    this.ROOT_URL = this.server.url + '/' + this.userCode
  });

  afterEach(async () => {
    await Promise.all([stopBrowser(), stopServer()])
  });

  const getNewTaskEntry = () => {
    return this.browser.wait(until.elementLocated(By.id('new_task_entry')));
  }

  const addTask = async (name) => {
    let entry = await getNewTaskEntry();
    await entry.sendKeys(name);
    await entry.sendKeys(Key.ENTER);
    await sleep(1000);
  }

  const getList = () => {
    return this.browser.wait(until.elementLocated(By.id('task_list')));
  }

  it("remembers the task across browser shutdown", async () => {
    await this.browser.get(this.ROOT_URL)
    await addTask('something')
    await stopBrowser()
    await startBrowser()
    await this.browser.get(this.ROOT_URL)
    await sleep(1000)
    expect((await getList().getText())).toContain('something');
  })

  it("remembers the task across server shutdown", async () => {
    await this.browser.get(this.ROOT_URL)
    await addTask('another')
    await stopServer()
    await startServer()
    await this.browser.get(this.ROOT_URL)
    await sleep(1000)
    expect((await getList().getText())).toContain('another');
  })

  it("remembers the task across shutdown of both server and browser", async () => {
    await this.browser.get(this.ROOT_URL)
    await addTask('remember')
    await stopBrowser()
    await stopServer()
    await startServer()
    await startBrowser()
    await this.browser.get(this.ROOT_URL)
    await sleep(1000)
    expect((await getList().getText())).toContain('remember');
  })
});
