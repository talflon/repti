'use strict';

const {createBrowser} = require('./defaults.js');

describe("Test that we can test", () => {
  it("can test things", () => {
    expect(true).toBe(true);
  });

  it("can open browser", async () => {
    let driver = await createBrowser();
    try {
      expect(await driver.getCurrentUrl()).not.toBe(null);
    } finally {
      await driver.quit();
    }
  });
});
