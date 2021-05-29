function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

exports.sleep = sleep;