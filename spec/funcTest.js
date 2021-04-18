'use strict';

const {createBrowser} = require('./defaults.js');

if (process.env.REPTI_URL) {
  var ROOT_URL = process.env.REPTI_URL;
} else {
  throw "Specify REPTI_URL=<the url>";
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

describe("Test our homepage", () => {
  beforeEach(async () => {
    this.browser = await createBrowser();
  });

  afterEach(async () => {
    await this.browser.quit();
  });

  it("has our title", async () => {
    await this.browser.get(ROOT_URL);
    expect(await this.browser.getTitle()).toBe("Repti!");
  });
});
