/*jslint node: true */
'use strict';
const constants = require('ocore/constants.js');
const conf = require('ocore/conf');
const objectHash = require('ocore/object_hash.js');
const headlessWallet = require('headless-obyte');

let my_address;

function getAddress() {
	if (!my_address)
		throw Error("my address not set yet");
	return my_address;
}

function getOwnerAddress() {
	return conf.owner_address || getAddress();
}

async function withdraw(asset, amount) {
	let message = {
		app: 'data',
		payload_location: 'inline',
		payload: {
			withdraw: 1,
			asset: asset,
			amount: amount,
		}
	};
	message.payload_hash = objectHash.getBase64Hash(message.payload, true);
	let opts = {
		messages: [message],
		amount: constants.MIN_BYTES_BOUNCE_FEE,
		to_address: conf.aa_address,
		paying_addresses: [my_address],
		change_address: my_address,
		spend_unconfirmed: 'all',
	};
	return await headlessWallet.sendMultiPayment(opts);
}

async function deposit(asset, amount) {
	let opts = {
		asset: asset,
		paying_addresses: [my_address],
		change_address: my_address,
		spend_unconfirmed: 'all',
	};
	if (!asset || asset === 'base') {
		opts.amount = amount;
		opts.to_address = conf.aa_address;
	}
	else {
		opts.base_outputs = [{ address: conf.aa_address, amount: constants.MIN_BYTES_BOUNCE_FEE }];
		opts.asset_outputs = [{ address: conf.aa_address, amount: amount }];
	}
	return await headlessWallet.sendMultiPayment(opts);
}

async function start() {
	return new Promise(resolve => {
		headlessWallet.readSingleAddress(_addr => {
			my_address = _addr;
			resolve();
		});
	});
}

exports.start = start;
exports.withdraw = withdraw;
exports.deposit = deposit;
exports.getAddress = getAddress;
exports.getOwnerAddress = getOwnerAddress;
