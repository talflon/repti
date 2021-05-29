'use strict';

const got = require('got');
const tmp = require('tmp')
tmp.setGracefulCleanup()

const {createServer} = require('../server.js');

const PORT = 9590;

describe("robots.txt", () => {
  beforeEach(async () => {
    this.storageDir = tmp.dirSync().name
    this.server = await createServer('localhost', PORT, this.storageDir)
  });

  afterEach(async () => {
    await this.server.close();
  });

  it("exists and is served", async () => {
    const response = await got(this.server.url + '/robots.txt')
    expect(response.statusCode).toBe(200);
  });

  it("blocks all robots", async () => {
    const response = await got(this.server.url + '/robots.txt')
    const responseBody = response.body.split(/[\r\n]+/).join('\n')
    expect(responseBody).toContain('User-agent: *\nDisallow: /')
  });
});