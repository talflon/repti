'use strict';

const fs = require('fs')
const path = require('path')
const tmp = require('tmp')
tmp.setGracefulCleanup()

const {By, Key, until} = require('selenium-webdriver');

const {createServer} = require('../server.js');
const {createBrowser} = require('./lib/browser.js');

const PORT = 8765;

//setupServer = async () => createServer('localhost', PORT, tmp.dirSync().name)

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

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

  const getListTexts = async () => {
    let list_table = await getListTable();
    let rows = await list_table.findElements(By.tagName('tr'));
    return await Promise.all(rows.map(row => row.getText()));
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

  it("lets you add two tasks", async () => {
    await this.browser.get(this.ROOT_URL);
    await addTask('read');
    await addTask('write');
    let text = await getList().getText()
    expect(text).toContain('read');
    expect(text).toContain('write');
  });
});
