const EventEmitter = require('events')//.EventEmitter;
const util = require( 'util' );
const WebSocket = require('ws');
const conf = require('ocore/conf');
const account = require('./account.js');
const exchange = require('./exchange.js');

let ws;

class WsEmitter extends EventEmitter {

	constructor() {
		super();
		this.ws = null;
	}

	connect(onDone) {
		let self = this;
		if (!onDone)
			return new Promise(resolve => this.connect(resolve));

		if (self.ws) {
			if (self.ws.readyState === self.ws.OPEN) {
				console.log("already connected");
				return onDone();
			}
			if (!self.ws.done) {
				console.log("already connecting");
				self.ws.once('done', onDone);
				return;
			}
			console.log("closing, will reopen");
		}

		self.ws = new WebSocket(conf.odex_ws_url);
		self.ws.setMaxListeners(20); // avoid warning

		self.ws.done = false;
		function finishConnection(_ws, err) {
			if (!_ws.done) {
				_ws.done = true;
				onDone(err);
				if (_ws)
					_ws.emit('done', err);
			}
		}

		let abandoned = false;
		let timeout = setTimeout(function () {
			abandoned = true;
			finishConnection(self.ws, 'timeout');
			self.ws = null;
		}, 5000);

		self.ws.once('open', function onWsOpen() {
			if (abandoned) {
				console.log("abandoned connection opened, will close");
				this.close();
				return;
			}
			clearTimeout(timeout);
			self.ws.last_ts = Date.now();
			console.log('connected');
			finishConnection(this);
			self.sendAddress(account.getOwnerAddress());
			self.emit('connected');
		});

		self.ws.on('close', function onWsClose() {
			console.log('ws closed');
			clearTimeout(timeout);
			self.ws = null;
			setTimeout(self.connect.bind(self), 1000);
			finishConnection(this, 'closed');
			self.emit('disconnected');
		});

		self.ws.on('error', function onWsError(e) {
			console.log("error from WS server: " + e);
			clearTimeout(timeout);
			var err = e.toString();
			self.ws = null;
			setTimeout(self.connect.bind(self), 1000);
			finishConnection(this, err);
		});

		self.ws.on('message', function (message) { // 'this' is set to ws
			self.onWebsocketMessage(this, message);
		});
	}


	onWebsocketMessage(_ws, message) {
		if (_ws.readyState !== _ws.OPEN)
			return console.log("received a message on ODEX socket with ready state " + _ws.readyState);
		
	//	console.log('received from ODEX '+ message);
		_ws.last_ts = Date.now();
		
		try {
			var objMessage = JSON.parse(message);
			var type = objMessage.event.type;
			var payload = objMessage.event.payload;
		}
		catch(e){
			return console.log('failed to json.parse message '+message);
		}
	//	if (typeof payload !== 'object')
	//		return console.log('payload is not an object: ' + payload);
		
		let channel = objMessage.channel;
	//	console.log('received from ODEX parsed:', objMessage);
		this.emit(channel, type, payload);
	}

	isConnected() {
		return (this.ws && this.ws.readyState === this.ws.OPEN);
	}

	async send(message) {
		let ws = this.ws;
		if (!ws || ws.readyState !== ws.OPEN) {
			let err = await this.connect();
			if (err)
				return err;
			ws = this.ws;
		}

		if (!ws)
			throw Error("no ws after connect");
		
		return new Promise(resolve => {
			if (typeof message === 'object')
				message = JSON.stringify(message);
			ws.send(message, function(err){
				if (err)
					ws.emit('error', 'From send: ' + err);
				resolve(err);
			});
		});
	}

	async subscribeTrades(pairName) {
		let [baseToken, quoteToken] = exchange.getAssetsByPair(pairName);
		const message = {
			"channel": "trades",
			"event": {
				"type": "SUBSCRIBE",
				"payload": {
					"baseToken": baseToken,
					"quoteToken": quoteToken,
					"name": pairName,
				}
			}
		};
		return await this.send(message);
	}

	async subscribeOrderbook(pairName) {
		let [baseToken, quoteToken] = exchange.getAssetsByPair(pairName);
		const message = {
			"channel": "orderbook",
			"event": {
				"type": "SUBSCRIBE",
				"payload": {
					"baseToken": baseToken,
					"quoteToken": quoteToken,
					"name": pairName,
				}
			}
		};
		return await this.send(message);
	}

	async subscribeRawOrderbook(pairName) {
		let [baseToken, quoteToken] = exchange.getAssetsByPair(pairName);
		const message = {
			"channel": "raw_orderbook",
			"event": {
				"type": "SUBSCRIBE",
				"payload": {
					"baseToken": baseToken,
					"quoteToken": quoteToken,
					"name": pairName,
				}
			}
		};
		return await this.send(message);
	}

	async subscribeOrdersAndTrades(pairName) {
		await this.subscribeTrades(pairName);
		await this.subscribeOrderbook(pairName);
		await this.subscribeRawOrderbook(pairName);	
	}

	async subscribeOHLCV(pairName, from, to, duration, units) {
		let [baseToken, quoteToken] = exchange.getAssetsByPair(pairName);
		const message = {
			"channel": "ohlcv",
			"event": {
				"type": "SUBSCRIBE",
				"payload": {
					"baseToken": baseToken,
					"quoteToken": quoteToken,
					"name": pairName,
					"from": from,
					"to": to,
					"duration": duration,
					"units": units,
				}
			}
		};
		return await this.send(message);
	}

	async sendAddress(address) {
		const message = {
			"channel": "orders",
			"event": {
				"type": "ADDRESS",
				"payload": address,
			}
		};
		return await this.send(message);
	}

	async sendOrder(signedOrder) {
		const message = {
			"channel": "orders",
			"event": {
				"type": "NEW_ORDER",
				"payload": signedOrder,
			}
		};
		return await this.send(message);
	}

	async sendCancel(signedCancel) {
		const message = {
			"channel": "orders",
			"event": {
				"type": "CANCEL_ORDER",
				"payload": signedCancel,
			}
		};
		return await this.send(message);
	}
}

module.exports = new WsEmitter();
/*
exports.connect = connect;
exports.send = send;

exports.subscribeTrades = subscribeTrades;
exports.subscribeOrderbook = subscribeOrderbook;
exports.subscribeRawOrderbook = subscribeRawOrderbook;
exports.subscribeOHLCV = subscribeOHLCV;

exports.sendAddress = sendAddress;
exports.sendOrder = sendOrder;
exports.sendCancel = sendCancel;
*/
//util.inherits(module.exports, EventEmitter);
