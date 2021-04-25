'use strict';

const fs = require('fs')

const got = require('got');
const tmp = require('tmp')
tmp.setGracefulCleanup()

const {createServer} = require('../server.js');

const PORT = 7743;

function makeServer() {
    return createServer('localhost', PORT, tmp.dirSync().name)
}

describe("createServer", () => {
    it("starts and stops", async () => {
        let server = await makeServer();
        await server.close();
    });

    it("has a root URL", async () => {
        let server = await makeServer();
        try {
            expect(server.url).toBeDefined();
        } finally {
            await server.close();
        }
    });

    it("returns 404 for invalid URL", async () => {
        let server = await makeServer();
        try {
            const response = await got(server.url + '/blahrgh', { throwHttpErrors: false });
            expect(response.statusCode).toBe(404);
        } finally {
            await server.close();
        }
    });

    it("has a storage directory", async () => {
        let server = await makeServer();
        try {
            expect(server.storageDir).toBeDefined()
            fs.opendirSync(server.storageDir).closeSync()
        } finally {
            await server.close();
        }
    });

    it("checks the storage directory", async () => {
        await expectAsync(createServer('localhost', PORT)).toBeRejected()
        await expectAsync(createServer('localhost', PORT, 'this is not a directory?')).toBeRejected()
    });
});
