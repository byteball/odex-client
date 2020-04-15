/*jslint node: true */
'use strict';
const constants = require('ocore/constants.js');
const conf = require('ocore/conf');
const eventBus = require('ocore/event_bus');
const headlessWallet = require('headless-obyte');
const account = require('./account.js');
const exchange = require('./exchange.js');
const rest_api = require('./rest_api.js');


/**
 * headless wallet is ready
 */
function start() {

	let tokensBySymbol = exchange.getTokensBySymbol();
	
	headlessWallet.setupChatEventHandlers();
	
	/**
	 * user pairs his device with the bot
	 */
	eventBus.on('paired', (from_address, pairing_secret) => {
		// send a geeting message
		const device = require('ocore/device.js');
		device.sendMessageToDevice(from_address, 'text', "Welcome to ODEX trading bot!");
	});

	/**
	 * user sends message to the bot
	 */
	eventBus.on('text', async (from_address, text) => {
		// analyze the text and respond
		text = text.trim();

		const device = require('ocore/device.js');
		const sendResponse = response => device.sendMessageToDevice(from_address, 'text', response);
		
		if (!headlessWallet.isControlAddress(from_address))
			return sendResponse("This bot can be managed only from control addresses.  If you are the owner, add your device address to the list of control addresses in conf.js or conf.json.");
		
		if (text === 'help') {
			let lines = [
				"[exchange balance](command:exchange balance) - query the bot's balance on the exchange;",
				"[deposit <amount> <token>](suggest-command:deposit <amount> <token>) - deposit tokens;",
				"[withdraw <amount> <token>](suggest-command:withdraw <amount> <token>) - withdraw tokens;",
				"[withdraw all <token>](suggest-command:withdraw all <token>) - withdraw the entire balance of a token.",
			];
			return sendResponse(lines.join("\n"));
		}

		if (text === 'exchange balance') {
			let balances = await rest_api.getBalances(account.getAddress());
			let lines = [];
			for (let symbol in balances) {
				let balance = balances[symbol];
				let token = tokensBySymbol[symbol];
				if (token)
					balance /= 10 ** token.decimals;
				lines.push(balance + " " + symbol);
			}
			return sendResponse(lines.join("\n"));
		}
		
		let arrMatches = text.match(/^(withdraw|deposit) ([\de.]+|all) (\w+)/i);
		if (arrMatches) {
			if (conf.owner_address)
				return sendResponse("The bot can't deposit/withdraw as it is acting on behalf of address " + owner_address);
			const command = arrMatches[1].toLowerCase();
			let amount = arrMatches[2].toLowerCase();
			const symbol = arrMatches[3];
			let token = tokensBySymbol[symbol];
			if (!token) {
				token = tokensBySymbol[symbol.toUpperCase()];
				if (!token)
					return sendResponse("No such token: " + symbol);
			}
			if (amount !== 'all' || command === 'deposit') {
				amount = parseFloat(amount);
				if (!amount)
					return sendResponse("bad amount: " + amount);
				amount = Math.round(amount * 10 ** token.decimals);
			}
			let response;
			try {
				let { unit } = (command === 'withdraw')
					? await account.withdraw(token.asset, amount)
					: await account.deposit(token.asset, amount);
				response = "Done " + command + ": https://" + (constants.bTestnet ? 'testnet' : '') + 'explorer.obyte.org/#' + unit;
			}
			catch (e) {
				response = "Failed to " + command + ": " + e;
			}
			sendResponse(response);
		}
	});

}


exports.start = start;

