'use strict';

const {Builder} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');

chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build())

function createBrowser() {
    let opts = new chrome.Options();
    if (process.env.REPTI_HEADLESS !== 'no') {
        opts = opts.headless();
    }
    return new Builder()
        .forBrowser('chrome')
        .setChromeOptions(opts)
        .build();
}

exports.createBrowser = createBrowser;
