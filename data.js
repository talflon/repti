'use strict'

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

module.exports = {
  randomTaskId,
  newTaskId
}
