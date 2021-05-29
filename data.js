'use strict'

const fs = require('fs')
const path = require('path')

const dayjs = require('dayjs')

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'

function randomTaskId() {
  let task_id = ''
  for (let i = 0; i < 6; i++) {
    task_id += BASE64_CHARS[Math.floor(Math.random() * 64)]
  }
  return task_id
}

function newTaskId(oldTaskIds) {
  let randomTaskId = module.exports.randomTaskId  // allows us to mock randomTaskId during testing
  var task_id;
  do {
    task_id = randomTaskId()
  } while (oldTaskIds.includes(task_id));
  return task_id
}

function DataStorage(dir) {
  this.dir = dir
}

DataStorage.prototype = {
  getFilePath: function (userCode) {
    return path.join(this.dir, userCode + '.json')
  },
  get: function (userCode) {
    try {
      let fileContents = fs.readFileSync(this.getFilePath(userCode))
      if (fileContents.length === 0) {
        return {
          order: [],
          tasks: {},
        }
      } else {
        return JSON.parse(fileContents)
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        return
      } else {
        throw err
      }
    }
  },
  put: function (userCode, userData) {
    fs.writeFileSync(this.getFilePath(userCode), JSON.stringify(userData))
  }
}

const DAYNUM_EPOCH = dayjs('2021-01-01')

function daynum(d) {
  return -DAYNUM_EPOCH.diff(d, 'day')
}

module.exports = {
  randomTaskId,
  newTaskId,
  DataStorage,
  daynum
}
