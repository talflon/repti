'use strict';

const fs = require('fs')
const path = require('path')
const tmp = require('tmp')
tmp.setGracefulCleanup()

const {By, Key, until} = require('selenium-webdriver');

const {createServer} = require('../server.js');
const {createBrowser} = require('./lib/browser.js');
const {sleep} = require('./lib/util.js')

const PORT = 8765;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000

describe("Test our homepage", () => {
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
    this.ROOT_URL = this.server.url + '/d/' + this.userCode
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

  it("has our title", async () => {
    await this.browser.get(this.ROOT_URL);
    expect(await this.browser.getTitle()).toBe("Repti!");
  });

  it("lets you add a task", async () => {
    await this.browser.get(this.ROOT_URL);
    await addTask('exercise');
    expect((await getList().getText())).toContain('exercise');
  });

  it("lets you add a task with a button", async () => {
    await this.browser.get(this.ROOT_URL);
    let entry = await getNewTaskEntry();
    await entry.sendKeys('coisa');
    let button = await this.browser.wait(until.elementLocated(By.xpath("//*[@id='new_task']//button[@type='submit']")))
    await button.click()
    await sleep(1000);
    expect((await getList().getText())).toContain('coisa');
  });

  it("lets you add two tasks", async () => {
    await this.browser.get(this.ROOT_URL);
    await addTask('read');
    await addTask('write');
    let text = await getList().getText()
    expect(text).toContain('read');
    expect(text).toContain('write');
  });
});
