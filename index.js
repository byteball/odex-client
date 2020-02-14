/*jslint node: true */
'use strict';
const account = require('./account.js');
const chat = require('./chat.js');
const ws_api = require('./ws_api.js');
const rest_api = require('./rest_api.js');
const orders = require('./orders.js');
const exchange = require('./exchange.js');
const headlessWallet = require('headless-obyte');


async function start() {
	await headlessWallet.waitTillReady();
	await account.start();
	await exchange.start();
	chat.start();
	await ws_api.connect();
}


exports.start = start;

exports.ws_api = ws_api;
exports.rest_api = rest_api;
exports.exchange = exchange;
exports.orders = orders;
exports.chat = chat;
exports.account = account;
