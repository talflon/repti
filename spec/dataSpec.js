'use strict';

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
