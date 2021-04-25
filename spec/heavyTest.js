'use strict';

const {By, Key, until} = require('selenium-webdriver');

const {createBrowser} = require('./defaults.js');

var setupServer;
if (process.env.REPTI_URL) {
  const ROOT_URL = process.env.REPTI_URL;

  console.log(`Testing on ${ROOT_URL}`)

  setupServer = async () => {
    return {
      url: ROOT_URL,
      close: async () => { }
    }
  }
} else {
  const {createServer} = require('../server.js');
  const PORT = 8765;

  console.log('Testing internally')

  setupServer = async () => createServer('localhost', PORT)
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

describe("Test our homepage", () => {
  beforeEach(async () => {
    [this.server, this.browser] = await Promise.all([
      setupServer(),
      createBrowser(),
    ]);
    this.ROOT_URL = this.server.url;
  });

  afterEach(async () => {
    await Promise.all([
      this.browser.quit(),
      this.server.close(),
    ]);
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
