const rest_api = require('./rest_api.js');

let operatorAddress;
let fees;
let tokensByAsset;
let tokensBySymbol;

function getOperatorAddress() {
	if (!operatorAddress)
		throw Error("no operatorAddress yet");
	return operatorAddress;
}

// returns { matcherFee, affiliateFee }
function getFees(symbol) {
	if (!fees)
		throw Error("no fees yet");
	return fees[symbol];
}

function getTokensBySymbol() {
	if (!tokensBySymbol)
		throw Error("no tokensBySymbol yet");
	return tokensBySymbol;
}

function getTokensByAsset() {
	if (!tokensByAsset)
		throw Error("no tokensByAsset yet");
	return tokensByAsset;
}

function getTokensByPair(pair) {
	if (!tokensBySymbol)
		throw Error("no tokensBySymbol yet");
	let [baseSymbol, quoteSymbol] = pair.split('/');
	if (!quoteSymbol)
		throw Error('bad pair: ' + pair);
	let baseToken = tokensBySymbol[baseSymbol];
	let quoteToken = tokensBySymbol[quoteSymbol];
	if (!baseToken)
		throw Error("base token not found: " + baseSymbol);
	if (!quoteToken)
		throw Error("quote token not found: " + quoteSymbol);
	if (!quoteToken.quote)
		throw Error(quoteSymbol + " is not a quote token");
	return [baseToken, quoteToken];
}

function getAssetsByPair(pair) {
	let [baseToken, quoteToken] = getTokensByPair(pair);
	return [baseToken.asset, quoteToken.asset];
}

async function start() {
	const info = await rest_api.fetchInfo();
	operatorAddress = info.operatorAddress;
	fees = info.fees;

	const tokens = await rest_api.fetchTokens();
	tokensByAsset = {};
	tokensBySymbol = {};
	tokens.forEach(token => {
		tokensByAsset[token.asset] = token;
		tokensBySymbol[token.symbol] = token;
	});
}

exports.getOperatorAddress = getOperatorAddress;
exports.getFees = getFees;
exports.getTokensBySymbol = getTokensBySymbol;
exports.getTokensByAsset = getTokensByAsset;
exports.getTokensByPair = getTokensByPair;
exports.getAssetsByPair = getAssetsByPair;
exports.start = start;
