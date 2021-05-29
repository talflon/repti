'use strict';

const fs = require('fs')
const path = require('path')

const tmp = require('tmp')
tmp.setGracefulCleanup()
const dayjs = require('dayjs')
const mockdate = require('mockdate')

const data = require('../data.js')

describe("Test task id generation", () => {

  describe("Test randomTaskId()", () => {
    it("creates a valid key", () => {
      for (let t = 0; t < 1000; t++) {
        let task_id = data.randomTaskId()
        expect(task_id).toBeDefined()
        let obj = {}
        obj[task_id] = 'the value set'
        expect(obj[task_id]).toBe('the value set')
      }
    });

    it("creates a reasonable key", () => {
      for (let t = 0; t < 1000; t++) {
        let task_id = data.randomTaskId()
        expect(task_id).not.toBe('')
        let obj = {}
        obj[task_id] = 'ok'
        expect(JSON.stringify(obj[task_id]).length).toBeLessThan(100)
      }
    });

    it("creates different keys", () => {
      for (let t = 0; t < 10; t++) {
        let task_ids = []
        for (let i = 0; i < 10; i++) {
          task_ids.push(data.randomTaskId())
        }
        expect([...new Set(task_ids)].length).toBe(10)
      }
    });
  });

  describe("Test newTaskId()", () => {
    it("tries until it gets a different task id", () => {
      let oldTaskIds = ['a', 'b', 'c']
      spyOn(data, 'randomTaskId').and.returnValues(...oldTaskIds.concat(['new']))
      expect(data.newTaskId(oldTaskIds)).toBe('new')
    });
  });
});

describe("task id storage", () => {
  beforeEach(() => {
    this.storageDir = tmp.dirSync().name
    this.storage = new data.DataStorage(this.storageDir)
    this.userCode = 'so-secret'
    this.storageFile = path.join(this.storageDir, this.userCode + '.json')
    fs.writeFileSync(this.storageFile, '')
  })

  it("returns undefined if no file", () => {
    expect(this.storage.get('not-' + this.userCode)).toBeUndefined()
  })

  it("creates new schema if empty file", () => {
    let userData = this.storage.get(this.userCode)
    expect(userData.tasks).toEqual({})
    expect(userData.order).toEqual([])
  })

  it("returns schema saved in file", () => {
    let userData = {
      order: ['one', 'two'],
      tasks: {
        one: { name: 'um' },
        two: { name: 'dois' }
      }
    }
    fs.writeFileSync(this.storageFile, JSON.stringify(userData))
    expect(this.storage.get(this.userCode)).toEqual(userData)
  })
})

describe("date handling: ", () => {
  describe("daynum", () => {
    afterEach(() => mockdate.reset())

    it("gives same number for same day", () => {
      expect(data.daynum(dayjs('2021-05-22 10:34')) - data.daynum(dayjs('2021-05-22 8:12'))).toBe(0)
    })
    it("counts days between", () => {
      expect(data.daynum(dayjs('2021-08-04 03:22')) - data.daynum(dayjs('2021-07-30 12:50'))).toBe(5)
    })
    it("gives today's number with no argument", () => {
      expect(data.daynum()).toBe(data.daynum(new Date()))

      const d = dayjs('2021-03-15 18:18')
      mockdate.set(d)
      expect(data.daynum(dayjs())).toBe(data.daynum(d))
      expect(data.daynum()).toBe(data.daynum(d))
    })
  })
})
