'use strict'
const http = require('http')
const {once} = require('events')
const express = require('express')
const got = require('got')
const stoppable = require('stoppable')

describe('express', () => {
  it('closes', async () => {
    let agent = new http.Agent({ keepAlive: true })

    let appA = express()
    appA.get('/', (req, res) => res.send('A'))
    let listenerA = stoppable(appA.listen(12345, 'localhost'), 200)
    await once(listenerA, 'listening')
    var result = await got('http://localhost:12345', { agent: { http: agent } })
    expect(result.body).toBe('A')
    await listenerA.stop()

    let appB = express()
    appB.get('/', (req, res) => res.send('B'))
    let listenerB = stoppable(appB.listen(12345, 'localhost'), 200)
    await once(listenerB, 'listening')
    result = await got('http://localhost:12345', { agent: { http: agent } })
    expect(result.body).toBe('B')
    await listenerB.stop()
  })
})
