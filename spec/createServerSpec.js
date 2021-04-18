'use strict';

const got = require('got');

const {createServer} = require('../server.js');

const PORT = 7743;

describe("createServer", () => {
    it("starts and stops", async () => {
        let server = await createServer('localhost', PORT);
        await server.close();
    });

    it("has an URL", async () => {
        let server = await createServer('localhost', PORT);
        try {
            expect(server.url).toBeDefined();
        } finally {
            await server.close();
        }
    });

    it("returns HTML from its URL", async () => {
        let server = await createServer('localhost', PORT);
        try {
            const response = await got(server.url);
            expect(response.headers["content-type"]).toMatch(/^text\/html/);
            expect(response.body).toBeTruthy();
        } finally {
            await server.close();
        }
    });
});
